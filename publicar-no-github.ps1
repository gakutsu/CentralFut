#Requires -Version 5.1
<#
 CentralFut V1.7.1 — Primeiro envio para um NOVO repositório GitHub.
 Requer Git e GitHub CLI (gh). Não solicita tokens nem senhas neste script.
 Execute após extrair o ZIP, a partir de qualquer diretório.
#>
param(
    [string]$Owner = 'gakutsu',
    [string]$Repo  = 'CentralFut'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$FullRepo = "$Owner/$Repo"
$ExpectedRemote = "https://github.com/$FullRepo.git"
$SiteUrl = "https://${Owner}.github.io/${Repo}/"

function CheckLastExit([string]$Message) {
    if ($LASTEXITCODE -ne 0) { throw "$Message (código $LASTEXITCODE)." }
}
function Step([string]$Message) {
    Write-Host "`n== $Message ==" -ForegroundColor Cyan
}
# Windows PowerShell 5.1 transforma mensagens esperadas no stderr (como
# 'remote origin não existe' e HTTP 404) em erros fatais quando Stop está ativo.
# Execute verificações que podem falhar com Continue e devolva o código real.
function Try-Native([string]$Command, [string[]]$Arguments) {
    $OriginalPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $OutputLines = @(& $Command @Arguments 2>$null)
        $Code = $LASTEXITCODE
        return [pscustomobject]@{
            ExitCode = $Code
            Output = (($OutputLines | ForEach-Object { [string]$_ }) -join "`n")
        }
    } finally {
        $ErrorActionPreference = $OriginalPreference
    }
}

try {
    Step 'Pré-verificação do pacote'
    foreach ($relative in @('index.html','src/bundle.js','src/style.css','.github/workflows/pages.yml')) {
        if (-not (Test-Path -LiteralPath (Join-Path $Root $relative) -PathType Leaf)) {
            throw "O arquivo '$relative' está faltando. Extraia o ZIP completo primeiro."
        }
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw 'Git não encontrado. Instale via: winget install --id Git.Git -e --source winget. Depois abra um NOVO PowerShell.'
    }
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw 'GitHub CLI não encontrado. Instale via: winget install --id GitHub.cli -e --source winget. Depois abra um NOVO PowerShell.'
    }

    Step 'Entrar no GitHub'
    $AuthStatus = Try-Native 'gh' @('auth', 'status')
    if ($AuthStatus.ExitCode -ne 0) {
        Write-Host 'Abrindo autenticação do GitHub no navegador...' -ForegroundColor Yellow
        & gh auth login --hostname github.com --git-protocol https --web
        CheckLastExit 'A autenticação não foi concluída'
    }
    $Login = (& gh api user --jq '.login') -join ''
    CheckLastExit 'Não foi possível consultar a conta GitHub'
    $Login = $Login.Trim()
    if ($Login -ine $Owner) {
        throw "A conta autenticada é '$Login', mas este pacote foi configurado para '$Owner'. Não publicarei na conta errada."
    }
    Write-Host "Conta confirmada: $Login" -ForegroundColor Green

    Step 'Preparar Git no projeto'
    Push-Location -LiteralPath $Root
    try {
        if (-not (Test-Path '.git')) {
            & git init -b main
            CheckLastExit 'Não foi possível inicializar o Git'
        }
        & git branch -M main
        CheckLastExit 'Não foi possível selecionar a branch main'

        # Identidade apenas deste repositório (sem alterar configurações globais).
        $Id = (& gh api user --jq '.id') -join ''
        CheckLastExit 'Não foi possível consultar o ID GitHub'
        & git config --local user.name $Login
        CheckLastExit 'Falha ao configurar o autor do commit'
        & git config --local user.email "$Id+$Login@users.noreply.github.com"
        CheckLastExit 'Falha ao configurar o e-mail privado de commit'

        # Em repositorios novos, 'origin' normalmente ainda NAO existe.
        # Nao chamar 'git remote get-url origin' antes de saber se ha o remote.
        $Remotes = @(& git remote)
        CheckLastExit 'Nao foi possivel consultar os remotos Git'
        $HasOrigin = $Remotes -contains 'origin'
        if ($HasOrigin) {
            $Origin = ((& git remote get-url origin) -join '').Trim()
            CheckLastExit 'Nao foi possivel ler o remoto origin'
            $RemoteValid = ($Origin -ieq $ExpectedRemote) -or ($Origin -ieq "git@github.com:$FullRepo.git")
            if (-not $RemoteValid) {
                throw "Este diretorio ja tem um remote diferente: $Origin. Publicacao interrompida para evitar sobrescrita."
            }
        }


        & git add -A
        CheckLastExit 'Falha ao preparar arquivos do commit'
        & git diff --cached --quiet
        $Pending = $LASTEXITCODE
        if ($Pending -eq 1) {
            & git commit -m 'Publicar CentralFut V1.7.1 - quatro campeonatos'
            CheckLastExit 'Falha ao criar commit'
        } elseif ($Pending -ne 0) {
            throw 'Não foi possível verificar as alterações preparadas.'
        }

        Step 'Criar repositório ou retomar envio'
        # $HasOrigin ja foi determinado de maneira segura acima.
        if (-not $HasOrigin) {
            Write-Host 'Remoto origin ainda nao existe. Criando o repositorio novo e conectando origin...' -ForegroundColor Cyan
            # Nao cria sobre um repositorio que ja existe: nenhum force push.
            $ExistingRepo = Try-Native 'gh' @('repo','view',$FullRepo,'--json','name','--jq','.name')
            if ($ExistingRepo.ExitCode -eq 0) {
                throw "Já existe o repositório https://github.com/$FullRepo. Nenhum arquivo foi enviado."
            }
            Write-Host "Criando repositório PÚBLICO: $FullRepo" -ForegroundColor Yellow
            & gh repo create $FullRepo --public --source . --remote origin --push --description 'CentralFut - Central de Campeonatos 2026'
            CheckLastExit 'Falha ao criar o repositório ou enviar a branch main'
        } else {
            Write-Host 'Remote já configurado. Atualizando a branch main, sem force push...' -ForegroundColor Yellow
            & git push -u origin main
            CheckLastExit 'Falha no envio para main (nenhuma operação forçada foi executada)'
        }
        Write-Host "Repositório: https://github.com/$FullRepo" -ForegroundColor Green

        Step 'Configurar GitHub Pages (GitHub Actions)'
        $PagesStatus = Try-Native 'gh' @('api', "repos/$FullRepo/pages", '--jq', '.build_type')
        if ($PagesStatus.ExitCode -eq 0) {
            $PagesConfig = Try-Native 'gh' @('api','-X','PUT',"repos/$FullRepo/pages",'-f','build_type=workflow')
        } else {
            $PagesConfig = Try-Native 'gh' @('api','-X','POST',"repos/$FullRepo/pages",'-f','build_type=workflow')
        }
        $PagesReady = ($PagesConfig.ExitCode -eq 0)

        if ($PagesReady) {
            Write-Host 'GitHub Pages configurado no modo GitHub Actions.' -ForegroundColor Green
            $WorkflowRun = Try-Native 'gh' @('workflow','run','pages.yml','-R',$FullRepo,'--ref','main')
            if ($WorkflowRun.ExitCode -ne 0) {
                Write-Host 'O workflow já será acionado por push; caso necessário, abra Actions e clique Run workflow.' -ForegroundColor Yellow
            }
        } else {
            Write-Host 'Arquivos enviados, mas o Pages requer ativação manual em Settings > Pages > Source: GitHub Actions.' -ForegroundColor Yellow
        }

        Step 'Publicação enviada'
        Write-Host "Site previsto: $SiteUrl" -ForegroundColor Green
        Write-Host "Acompanhar: https://github.com/$FullRepo/actions"
        Write-Host 'Acesse o site somente após o workflow de publicação terminar com sucesso.' -ForegroundColor Yellow
        Write-Host 'O JogosApp não foi alterado.' -ForegroundColor Green
    } finally {
        Pop-Location
    }
} catch {
    Write-Host "`nPUBLICAÇÃO NÃO CONCLUÍDA: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Copie esta mensagem completa para o ChatGPT. Não exclua a pasta extraída.' -ForegroundColor Yellow
    exit 1
}
