import * as vscode from 'vscode';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EXTENSION_VERSION = 'v1.1.0';

if (!OPENAI_API_KEY) {
	console.error('The OPENAI_API_KEY environment variable is not set. Please set it before starting VSCode to use this extension.');
}

function mapLanguageId(languageId: string): string {
	switch (languageId) {
		case 'plaintext':
			return 'markup';
		case 'c':
		case 'c++':
			return 'clike';
		case 'cpp':
			return 'cpp';
		case 'csharp':
			return 'csharp';
		case 'css':
			return 'css';
		case 'dockerfile':
			return 'docker';
		case 'fsharp':
			return 'fsharp';
		case 'git-commit':
		case 'git-rebase':
			return 'git';
		case 'go':
			return 'go';
		case 'html':
			return 'markup';
		case 'java':
			return 'java';
		case 'javascript':
			return 'javascript';
		case 'json':
			return 'json';
		case 'latex':
			return 'latex';
		case 'lua':
			return 'lua';
		case 'markdown':
			return 'markdown';
		case 'objective-c':
			return 'objectivec';
		case 'php':
			return 'php';
		case 'perl':
			return 'perl';
		case 'python':
			return 'python';
		case 'r':
			return 'r';
		case 'ruby':
			return 'ruby';
		case 'rust':
			return 'rust';
		case 'scala':
			return 'scala';
		case 'shellscript':
			return 'bash';
		case 'sql':
			return 'sql';
		case 'swift':
			return 'swift';
		case 'typescript':
			return 'typescript';
		case 'xml':
			return 'markup';
		case 'yaml':
			return 'yaml';
		default:
			// If there's no mapping, default to the provided languageId.
			return languageId;
	}
}

function createMarkdownSummary(
	text: string,
	summary: string,
	maxTokens: number,
	tokensUsed: number,
	promptTokens: number,
	completionTokens: number,
	finishReason: string,
	created: number,
	model: string,
	id: string,
	languageId: string,
	mappedLanguageId: string,
	gptModel: string,
	roleSystemContent: string,
	roleAssistantContent: string,
	roleUserContent: string
): string {
	// Escape code snippet to prevent Markdown rendering issues
	const escapedText = text.replace(/`/g, '\\`');
	// Count the occurrences of triple backticks in the summary
	const backtickMatches = summary.match(/```/g);
	const backtickCount = backtickMatches ? backtickMatches.length : 0;

	// If the count is odd, append a triple backtick to the end of the summary
	if (backtickCount % 2 !== 0) {
		summary += '\n```';
	}
	const markdownContent = `
# Code Summary

- **Extension Version**: ${EXTENSION_VERSION}
- **GPT Model**: ${gptModel}
- **Model Used**: ${model}
- **Request ID**: ${id}
- **Timestamp**: ${new Date(created * 1000).toLocaleString()}
- **Max Tokens**: ${maxTokens}

## Code
\`\`\`${mappedLanguageId}
${escapedText}
\`\`\`

## OpenAI Code Analyzer Summary
${summary}

## Tokens Used
- **Total Tokens**: ${tokensUsed}
- **Prompt Tokens**: ${promptTokens}
- **Completion Tokens**: ${completionTokens}
- **Finish Reason**: ${finishReason === 'length' ? '<span style="color: red; font-weight: bold;">' + finishReason + '</span>' : finishReason}

*NOTE: you might need to increase max tokens in the configuration if Finish Reason is <span style="color:red; font-weight:bold;">length</span>. This might suggest that the output above has been truncated*

## Language Ids
- **Source Language Id**: ${languageId}
- **Mapped Language Id**: ${mappedLanguageId}


## Prompts Used
- **System Prompt**: ${roleSystemContent}
- **Assistant Prompt**: ${roleAssistantContent}
- **User Prompt**: ${roleUserContent}

## Change settings
[Open Settings](command:extension.openaiCodeAnalyzerSettings) NOTE: Link does not work in Preview mode!

To configure this extension, follow these steps:

1. Open the Command Palette with \`Ctrl+Shift+P\` (Windows/Linux) or \`Cmd+Shift+P\` (macOS).
2. Type "OpenAI Code Analyzer Settings"
3. This will open settings for this extension where you can override VS Code's settings with your own.
4. Update the OpenAI Code Analyzer settings as needed.
5. Reload window for changes to take effect.


`;
	return markdownContent;
}

async function openMarkdownPreview(markdownContent: string): Promise<void> {
	// Create an untitled document with the Markdown language identifier
	const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content: markdownContent });

	// Show the text document in the editor
	await vscode.window.showTextDocument(doc, vscode.ViewColumn.Two);

	// Execute the Markdown preview command to open the preview pane
	await vscode.commands.executeCommand('markdown.showPreview', doc.uri);
}


async function summarizeText(text: string, gptModel: string, maxTokens: number, roleSystemContent: string, roleAssistantContent: string, roleUserContent: string): Promise<{ summary: string; tokensUsed: number; promptTokens: number; completionTokens: number, finishReason: string, created: number, model: string, id: string }> {
	if (!OPENAI_API_KEY) {
		throw new Error('The OPENAI_API_KEY environment variable is not set.');
	}
	const response = await axios.post(
		'https://api.openai.com/v1/chat/completions',
		{
			model: gptModel,
			"messages": [
				{
					role: "system",
					content: roleSystemContent,
				},
				{
					role: "assistant",
					content: roleAssistantContent,
				},
				{
					role: "user",
					content: `${roleUserContent}\n${text}\n`,
				}
			],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			max_tokens: maxTokens,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			top_p: 1,
			stop: null,
			temperature: 0,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			frequency_penalty: 0,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			presence_penalty: 0,
		},
		{
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'Authorization': `Bearer ${OPENAI_API_KEY}`,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'Content-Type': 'application/json',
			}
		}
	);

	const summary = response.data.choices[0].message.content;
	const tokensUsed = response.data.usage.total_tokens;
	const promptTokens = response.data.usage.prompt_tokens;
	const completionTokens = response.data.usage.completion_tokens;
	const finishReason = response.data.choices[0].finish_reason;
	const created = response.data.created;
	const model = response.data.model;
	const id = response.data.id;


	return { summary, tokensUsed, promptTokens, completionTokens, finishReason, created, model, id };
}

export function activate(context: vscode.ExtensionContext) {

	let openSettingsDisposable = vscode.commands.registerCommand('extension.openaiCodeAnalyzerSettings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', 'openaiCodeAnalyzer');
	});
	context.subscriptions.push(openSettingsDisposable);

	const config = vscode.workspace.getConfiguration('openaiCodeAnalyzer');
	const gptModel = config.get<string>('gptModel') || 'gpt-4';
	const maxTokens = config.get<number>('maxTokens') || 100;
	const roleSystemContent = config.get<string>('roleSystemContent') || 'You are an expert developer in all programming languages and an experienced code reviewer who follows the latest set of best practices when creating and reviewing code';
	const roleAssistantContent = config.get<string>('roleAssistantContent') || '';
	const roleUserContent = config.get<string>('roleUserContent') || 'Please do the two following tasks for the enclosed PROGRAMMING CODE at the end. 1) Analyze and provide a summary for an experienced programmer. 2: Perform a relevant code-review. Prettify and markdown format your reply as bullet-points for a vscode.window.createWebviewPanel';
	let disposable = vscode.commands.registerCommand('extension.summarizeCode', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('Please open a file to use this extension.');
			return;
		}

		const selectedText = editor.document.getText(editor.selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('Please select some text to summarize.');
			return;
		}
		const languageId = editor.document.languageId;
		const mappedLanguageId = mapLanguageId(languageId);
		try {
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Summarizing Code ",
				cancellable: true
			}, async (progress, token) => {
				token.onCancellationRequested(() => {
					console.log("User canceled the long running operation");
				});

				progress.report({ increment: 0, message: "Calling OpenAI API...(this might take a few seconds)" });
				const { summary, tokensUsed, promptTokens, completionTokens, finishReason, created, model, id } = await summarizeText(selectedText, gptModel, maxTokens, roleSystemContent, roleAssistantContent, roleUserContent);
				progress.report({ increment: 50, message: "Generating Markdown Preview..." });

				const markdownSummary = createMarkdownSummary(
					selectedText, summary, maxTokens, tokensUsed, promptTokens, completionTokens, finishReason, created, model, id, languageId, mappedLanguageId, gptModel, roleSystemContent, roleAssistantContent, roleUserContent);
				await openMarkdownPreview(markdownSummary);

				progress.report({ increment: 100, message: "Done!" });
			});

		} catch (error) {
			console.error('Error:', error);

			if ((error as any).response && (error as any).response.data && (error as any).response.data.error) {
				vscode.window.showErrorMessage(`An error occurred while summarizing the text: ${(error as any).response.data.error.message}`);
			} else if (error instanceof Error) {
				vscode.window.showErrorMessage(`An error occurred while summarizing the text: ${error.message}`);
			} else {
				vscode.window.showErrorMessage('An error occurred while summarizing the text. Please try again.');
			}
		}

	});

	context.subscriptions.push(disposable);



}

export function deactivate() { }
