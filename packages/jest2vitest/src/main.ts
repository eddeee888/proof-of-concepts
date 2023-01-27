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
    const importsFromVitestMap: Record<string, true> = {};

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
          importsFromVitestMap[expressionName] = true;
        }
      });

    sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .forEach((node) => {
        const identifier = node
          .getNodeProperty('expression')
          .asKind(SyntaxKind.Identifier);

        // Replace jest.something/vi.something with vi.something
        if (identifier && ['jest', 'vi'].includes(identifier.getText())) {
          importsFromVitestMap['vi'] = true;
          identifier.replaceWithText('vi');
        }

        // If there's `it.each` or `test.each`, import `it` or `test`
        switch (node.getText()) {
          case 'it.each':
            importsFromVitestMap['it'] = true;
            break;
          case 'test.each':
            importsFromVitestMap['test'] = true;
            break;
          default:
            break;
        }
      });

    // Import required functions
    const importsFromVitest = Object.keys(importsFromVitestMap);
    if (importsFromVitest.length > 0) {
      sourceFile.insertStatements(
        0,
        `import { ${importsFromVitest.join(', ')} } from 'vitest';`
      );
      sourceFile.saveSync();
    }
  });
};
