import * as assert from 'assert';
import * as vscode from 'vscode';
import { afterEach, beforeEach } from 'mocha';

suite('Extension Test Suite', () => {
	const testFileName = 'test.py';
	const testFileLanguage = 'python';
	const testFileContent = 'print("Hello, World!")';
	const testFileUri = vscode.Uri.file(`${__dirname}/${testFileName}`);

	beforeEach(async () => {
		await vscode.workspace.openTextDocument(testFileUri);
	});

	afterEach(async () => {
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test('Code summary command should display WebView', async () => {
		// Open the test file
		const document = await vscode.workspace.openTextDocument(testFileUri);
		const editor = await vscode.window.showTextDocument(document);

		// Select the content in the editor
		const range = new vscode.Range(document.positionAt(0), document.positionAt(testFileContent.length));
		editor.selection = new vscode.Selection(range.start, range.end);

		// Execute the command
		await vscode.commands.executeCommand('extension.summarizeCode');

		// Check if the WebView is visible
		const visibleWebViews = vscode.window.visibleTextEditors.filter((editor) => {
			return editor.document.uri.scheme === 'vscode-webview';
		});

		assert.strictEqual(visibleWebViews.length, 1, 'There should be one WebView visible after executing the summarizeCode command');
	});
});
