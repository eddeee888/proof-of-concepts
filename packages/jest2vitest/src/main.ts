import { Project, SyntaxKind } from 'ts-morph';

const testBasicImports: Record<string, true> = {
  describe: true,
  it: true,
  test: true,
  expect: true,
  beforeEach: true,
  beforeAll: true,
  afterEach: true,
  afterAll: true,
};

export const main = async (filePattern: string): Promise<void> => {
  const project = new Project();
  project.addSourceFilesAtPaths(filePattern);

  project.getSourceFiles().forEach((sourceFile) => {
    const functionsToImportFromVitestMap: Record<string, true> = {};

    // Clean up all `import {...} from 'vitest'` for idempotency
    sourceFile.getImportDeclarations().forEach((importDeclaration) => {
      if (
        ["'vitest'", '"vitest"'].includes(
          importDeclaration.getModuleSpecifier().getText()
        )
      ) {
        importDeclaration.remove();
      }
    });

    // Find all call expressions functions
    sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach((node) => {
        const expressionName = node.getNodeProperty('expression').getText();
        if (testBasicImports[expressionName]) {
          functionsToImportFromVitestMap[expressionName] = true;
        }
      });

    // Replace jest.something with vi.something
    sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .forEach((node) => {
        const identifier = node
          .getNodeProperty('expression')
          .asKind(SyntaxKind.Identifier);

        if (identifier && ['jest', 'vi'].includes(identifier.getText())) {
          functionsToImportFromVitestMap['vi'] = true;
          identifier.replaceWithText('vi');
        }
      });

    const functionsToImportFromVitest = Object.keys(
      functionsToImportFromVitestMap
    );
    if (functionsToImportFromVitest.length > 0) {
      sourceFile.insertStatements(
        0,
        `import { ${functionsToImportFromVitest.join(', ')} } from 'vitest';`
      );
      sourceFile.saveSync();
    }
  });
};
