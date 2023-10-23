# Visual Studio Code OpenAI Code Analyzer

The "vscode-openai-code-analyzer" is a Visual Studio Code extension that leverages OpenAI GPT technology to analyze and summarize code snippets in various programming languages. It also performs a code review. This is configurable thru the contents of the system, assistent and user roles (see Configuration section below).

## Features

This revamped extension now includes:

- Improved user interaction with the **Summarize Code** and **OpenAI Code Analyzer Settings** commands.
- More comprehensive code analysis and summarization by utilizing a role-based message system in OpenAI API calls.
- Enhanced configurability with options to specify the GPT model and customize the content of system, assistant, and user prompts.
- A new Markdown preview feature that renders the summary, token usage, and other relevant information in a well-formatted Markdown document.
- Error handling improvements to provide more informative error messages.
- Progress reporting during the summarization process.


## Requirements

To use this extension, you need an OpenAI API key. Set the `OPENAI_API_KEY` environment variable with your API key value. For example:
```
cd /mysrc/
export OPENAI_API_KEY=sk-...
code .
```
## Usage

1. Select the code snippet you want to analyze in the editor.
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Palette.
3. Type "Summarize Code" and press Enter.

The extension will send the selected code to the OpenAI API, and the summary along with other relevant information will be displayed in a new Markdown preview pane.

## Configuration

You can configure the following settings in Visual Studio Code:

- `openaiCodeAnalyzer.maxTokens`: Set the maximum number of tokens for the code summary generated by OpenAI API (default is 600).
- `openaiCodeAnalyzer.gptModel`: Specify the GPT model to use with the OpenAI API (default is "gpt-4").
- `openaiCodeAnalyzer.roleSystemContent`: Customize the content for the system role message.
- `openaiCodeAnalyzer.roleAssistantContent`: Customize the content for the assistant role message.
- `openaiCodeAnalyzer.roleUserContent`: Customize the content for the user role message.

To access these settings, follow these steps:

1. Open the Command Palette with `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).
2. Type "OpenAI Code Analyzer Settings" and press Enter. This will open settings for this extension where you can override VS Code's settings with your own.

## Build and Install the Extension

### Using Docker

1. Make sure you have Docker installed on your machine.
2. Set the `OPENAI_API_KEY` environment variable with your API key value.
3. Run the `docker_build.sh` script to build the Docker image.
```
docker_build.sh
```
4. Run the `docker_test.sh` script to test the project.
```
docker_test.sh
```

### Manually

To build and install the extension locally, follow these steps:

1. Clone the repository to your local machine.
```
git clone https://github.com/NorSoulx/vscode-openai-code-analyzer.git
```

2. Change to the cloned repository directory.

```
cd vscode-openai-code-analyzer
```

3. Install the required dependencies.

```
npm install
```

4. Build the extension.

```
npm run package
```

This command will generate a `.vsix` file in the project directory.

5. Install the extension in Visual Studio Code.

- Open Visual Studio Code.
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Palette.
- Type "Extensions: Install from VSIX..." and press Enter.
- Locate the `.vsix` file generated in step 4 and click "Open" to install the extension.

## Known Issues

None at the moment.

## Release Notes

### 1.1.0

- Added new commands and configuration options for enhanced customizability and user interaction.
- Introduced a Markdown preview feature for rendering summaries.
- Improved error handling and progress reporting.
- Updated the OpenAI API interaction to use a role-based message system for better summarization results.

### 1.0.0

- Initial release of the "openai-code-analyzer" extension with support for various programming languages.

## Feedback

If you encounter any issues or have any suggestions for improvements, please [create an issue on GitHub](https://github.com/NorSoulx/vscode-openai-code-analyzer/issues).

**Enjoy using the Visual Studio Code OpenAI Code Analyzer extension!**

## Example screenshots (v1.1.x)

![example_v1 1 0_rust_a_001](https://github.com/NorSoulx/vscode-openai-code-analyzer/assets/4839848/8901c4bb-559f-482a-9398-f26ed01bb280)
![example_v1 1 0_rust_a_002](https://github.com/NorSoulx/vscode-openai-code-analyzer/assets/4839848/6a1fa2a1-be5d-42c3-8c13-d5fdd00bfe59)
![example_v1 1 0_rust_a_003](https://github.com/NorSoulx/vscode-openai-code-analyzer/assets/4839848/2183697b-6ca6-4603-a597-18502ea5eda8)
![example_v1 1 0_rust_a_004](https://github.com/NorSoulx/vscode-openai-code-analyzer/assets/4839848/c98d67a9-f48a-4e51-bbe0-47015e675143)


