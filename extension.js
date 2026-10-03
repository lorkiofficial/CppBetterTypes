const vscode = require('vscode');

async function fileExists(uri) 
{
    try 
    {
        await vscode.workspace.fs.stat(uri);
        return true;
    } 
    catch 
    {
        return false;
    }
}


function getCurrentProject() 
{
    const editor = vscode.window.activeTextEditor;

    if (!editor) 
    {
        vscode.window.showErrorMessage('CppBetterTypes: Error, no active file. ⚠️');
        return;
    }

    const folder = vscode.workspace.getWorkspaceFolder(
        editor.document.uri
    );

    if (!folder) 
    {
        vscode.window.showErrorMessage(
            'CppBetterTypes: Error, the current file is not inside a workspace. ⚠️'
        );
        return;
    }

    return folder;
}


function findCMakeProjectEnd(text)
{
    return findCMakeProjectEndStart(text, text.indexOf('project'));
}

function findCMakeProjectEndStart(text, projectPos)
{
    while (projectPos !== -1)
    {
        let i = projectPos - 1;

        while (
            i >= 0 &&
            (text[i] === ' ' || text[i] === '\t')
        )
        {
            i--;
        }

        if (i < 0 || text[i] === '\n')
        {
            const result = findCMakeProjectEndOpenParen(text,projectPos);

            if (result !== -2)
            {
                return result;
            }
        }

        projectPos = text.indexOf(
            'project',
            projectPos + 7
        );
    }

    return -1;
}

function findCMakeProjectEndOpenParen(text, projectPos)
{
    let openParen = projectPos + 7;

    while (
        openParen < text.length &&
        (text[openParen] === ' ' || text[openParen] === '\t')
    )
    {
        openParen++;
    }

    if (
        openParen >= text.length ||
        text[openParen] !== '('
    )
    {
        return -2;
    }

    return findCMakeProjectEndCloseParen(
        text,
        openParen
    );
}

function findCMakeProjectEndCloseParen(text, openParen)
{
    let depth = 0;

    for (let i = openParen; i < text.length; i++)
    {
        if (text[i] === '(')
        {
            depth++;
        }
        else if (text[i] === ')')
        {
            depth--;

            if (depth === 0)
            {
                return i + 1;
            }
        }
    }

    return -3;
}

const marker =
    '\n\n' +
    '# >>> CppBetterTypes >>>\n' +
    '# DONT REMOVE THIS LINE!\n' +
    '# AND DONT MOVE IT and project(...) block!\n' +
    'include(.cppbettertypes/CppBetterTypes.cmake)\n' +
    '# <<< CppBetterTypes <<<';

function activate(context) 
{
    console.log('=== CppBetterTypes ACTIVATED ===');

    const connectCommand = vscode.commands.registerCommand(
        'cppbettertypes.connect',
        async () => 
        {
            const project = getCurrentProject();

            if (!project) {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Connect: Error, no project is open. ⚠️'
                );
                return;
            }

            const cmakeUri = vscode.Uri.joinPath(
                project.uri,
                'CMakeLists.txt'
            );

            if (!(await fileExists(cmakeUri))) 
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Connect: Error, CMakeLists.txt in main directory not found. ⚠️'
                );
                return;
            }

            const data = await vscode.workspace.fs.readFile(cmakeUri);
            const text = Buffer.from(data).toString('utf8');

            const cMakeProjectEnd = findCMakeProjectEnd(text);

            if (cMakeProjectEnd === -1)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Connect: Error, CMake project() not found. ⚠️'
                );
                return;
            }

            if (cMakeProjectEnd === -2)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Connect: Error, CMake project() opening parenthesis not found. ⚠️'
                );
                return;
            }

            if (cMakeProjectEnd === -3)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Connect: Error, CMake project() closing parenthesis not found. ⚠️'
                );
                return;
            }

            const integrationDir = vscode.Uri.joinPath(
                project.uri,
                '.cppbettertypes'
            );

            const isIntegrationDirExists = await fileExists(integrationDir);
            const isMarkerExists = text.slice(cMakeProjectEnd).startsWith(marker);

            if (isIntegrationDirExists && isMarkerExists) 
            {
                vscode.window.showInformationMessage(
                    'CppBetterTypes Connect: Already connected. ✅'
                );
                return;
            }

            if (!isIntegrationDirExists)
            {
                await vscode.workspace.fs.createDirectory(integrationDir);

                const destinationCmake = vscode.Uri.joinPath(
                    integrationDir,
                    'CppBetterTypes.cmake'
                );

                const sourceCmake = vscode.Uri.joinPath(
                    context.extensionUri,
                    'CppBetterTypes.cmake'
                );

                const sourceTypes = vscode.Uri.joinPath(
                    context.extensionUri,
                    'types'
                );

                const destinationTypes = vscode.Uri.joinPath(
                    integrationDir,
                    'types'
                );

                await vscode.workspace.fs.copy(
                    sourceTypes,
                    destinationTypes
                );

                await vscode.workspace.fs.copy(
                    sourceCmake,
                    destinationCmake
                );
            }
            if (!isMarkerExists)
            {
                const newText = text.slice(0, cMakeProjectEnd) + marker + text.slice(cMakeProjectEnd);

                await vscode.workspace.fs.writeFile(
                    cmakeUri,
                    Buffer.from(newText, 'utf8')
                );
            }

            vscode.window.showInformationMessage(
                'CppBetterTypes Connect: Successfully connected. ✅'
            );
        }
    );

    const disconnectCommand = vscode.commands.registerCommand(
        'cppbettertypes.disconnect',
        async () => {
            const project = getCurrentProject();

            if (!project) {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Disconnect: Error, no project is open. ⚠️'
                );
                return;
            }

            const cmakeUri = vscode.Uri.joinPath(
                project.uri,
                'CMakeLists.txt'
            );

            if (!(await fileExists(cmakeUri))) 
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Disconnect: Error, CMakeLists.txt in main directory not found. ⚠️'
                );
                return;
            }

            const data = await vscode.workspace.fs.readFile(cmakeUri);
            const text = Buffer.from(data).toString('utf8');

            const cMakeProjectEnd = findCMakeProjectEnd(text);

            if (cMakeProjectEnd === -1)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Disconnect: Error, CMake project() not found. ⚠️'
                );
                return;
            }

            if (cMakeProjectEnd === -2)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Disconnect: Error, CMake project() opening parenthesis not found. ⚠️'
                );
                return;
            }

            if (cMakeProjectEnd === -3)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Disconnect: Error, CMake project() closing parenthesis not found. ⚠️'
                );
                return;
            }

            const integrationDir = vscode.Uri.joinPath(
                project.uri,
                '.cppbettertypes'
            );


            const isIntegrationDirExists = await fileExists(integrationDir);
            const isMarkerExists = text.slice(cMakeProjectEnd).startsWith(marker);


            if (!isIntegrationDirExists && !isMarkerExists)
            {
                vscode.window.showInformationMessage(
                    'CppBetterTypes Disconnect: Already disconnected. ✅'
                );
                return;
            }
            
            if (isIntegrationDirExists)
            {
                await vscode.workspace.fs.delete(
                    integrationDir,
                    { recursive: true }
                );
            }

            if (isMarkerExists)
            {
                const newText = text.slice(0, cMakeProjectEnd) + text.slice(cMakeProjectEnd + marker.length);

                await vscode.workspace.fs.writeFile(
                    cmakeUri,
                    Buffer.from(newText, 'utf8')
                );
            }

            vscode.window.showInformationMessage(
                'CppBetterTypes Disconnect: Successfully disconnected. ✅'
            );
        }
    );

    const statusCommand = vscode.commands.registerCommand(
        'cppbettertypes.status',
        async () => {
            const project = getCurrentProject();

            if (!project) {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Status: Error, no project is open. ⚠️'
                );
                return;
            }

           

            const cmakeUri = vscode.Uri.joinPath(
                project.uri,
                'CMakeLists.txt'
            );

            if (!(await fileExists(cmakeUri))) 
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Status: Error, CMakeLists.txt in main directory not found. ⚠️'
                );
                return;
            }

            const data = await vscode.workspace.fs.readFile(cmakeUri);
            const text = Buffer.from(data).toString('utf8');

            const cMakeProjectEnd = findCMakeProjectEnd(text);

            if (cMakeProjectEnd === -1)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Status: Error, CMake project() not found. ⚠️'
                );
                return;
            }

            if (cMakeProjectEnd === -2)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Status: Error, CMake project() opening parenthesis not found. ⚠️'
                );
                return;
            }

            if (cMakeProjectEnd === -3)
            {
                vscode.window.showErrorMessage(
                    'CppBetterTypes Status: Error, CMake project() closing parenthesis not found. ⚠️'
                );
                return;
            }

            const integrationDir = vscode.Uri.joinPath(
                project.uri,
                '.cppbettertypes'
            );

            const isIntegrationDirExists = await fileExists(integrationDir);
            const isMarkerExists = text.slice(cMakeProjectEnd).startsWith(marker);

            if (isIntegrationDirExists && isMarkerExists) 
            {
                vscode.window.showInformationMessage(
                    'CppBetterTypes Status: Already connected. ✅'
                );
                return;
            }
            else
            {
                vscode.window.showInformationMessage(
                    'CppBetterTypes Status: Not connected. ❌'
                );
                return;
            }
        }
    );

    context.subscriptions.push(
        connectCommand,
        disconnectCommand,
        statusCommand
    );
}

function deactivate() 
{
    console.log('=== CppBetterTypes DEACTIVATED ===');
}

module.exports = 
{
    activate,
    deactivate
};