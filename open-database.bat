@echo off
REM Batch file to open PostgreSQL database
REM This will try to find and use psql or open pgAdmin

echo.
echo ========================================
echo   PostgreSQL Database Access
echo ========================================
echo.

REM Try to find psql in common locations
set PSQL_PATH=
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
) else if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\psql.exe
)

if defined PSQL_PATH (
    echo Found psql at: %PSQL_PATH%
    echo.
    echo Connecting to database: ssts_db
    echo You'll be prompted for the postgres password.
    echo.
    echo Useful commands once connected:
    echo   \dt              - List all tables
    echo   SELECT * FROM tickets;  - View all tickets
    echo   SELECT * FROM users;    - View all users
    echo   \q               - Quit
    echo.
    pause
    "%PSQL_PATH%" -U postgres -d ssts_db
) else (
    echo psql command not found in standard locations.
    echo.
    echo Opening pgAdmin instead...
    echo.
    echo If pgAdmin doesn't open automatically:
    echo   1. Open pgAdmin from Start Menu
    echo   2. Connect to server: localhost:5432
    echo   3. Username: postgres
    echo   4. Password: [your PostgreSQL password]
    echo   5. Navigate to: Databases ^> ssts_db
    echo.
    
    REM Try to open pgAdmin
    start "" "C:\Program Files\PostgreSQL\16\bin\pgAdmin4.exe" 2>nul
    if errorlevel 1 (
        start "" "C:\Program Files\PostgreSQL\15\bin\pgAdmin4.exe" 2>nul
    )
    if errorlevel 1 (
        start "" "C:\Program Files\PostgreSQL\14\bin\pgAdmin4.exe" 2>nul
    )
    if errorlevel 1 (
        echo.
        echo Could not find pgAdmin automatically.
        echo Please open pgAdmin manually from the Start Menu.
    )
    
    pause
)

