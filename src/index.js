module.exports = function({types: t}) {
  const BREAKABLE_CONTAINER_NODE_TYPES = [
    "GeneratorExpression",
    "ForStatement",
    "DoWhileStatement",
    "WhileStatement",
    "ForInStatement",
    "ForOfStatement"
  ];

  // nodes that have their own scope
  const CONTEXTUAL_CONTAINER_NODE_TYPES = [
    "FunctionExpression",
    "FunctionDeclaration",
    "Program",
    "ClassMethod",
    "ObjectMethod"
  ];

  const GeneratorExpressionVisitor = {
    BreakStatement: {
      exit(path) {
        const firstHit = path.find(p => BREAKABLE_CONTAINER_NODE_TYPES.includes(p.node.type));
        if (!firstHit || !firstHit.isGeneratorExpression() || !this.labelIdentifier) {
          return;
        }
        path.node.label = this.labelIdentifier;
      }
    },
    ThisExpression: {
      // bind this with outer scope's this
      enter(path) {
        const firstHit = path.find(p => CONTEXTUAL_CONTAINER_NODE_TYPES.includes(p.node.type));

        if (firstHit.isProgram()) {
          path.replaceWith(t.Identifier("undefined"), path.node);
        } else {
          const blockStatement = firstHit.get("body");
          if (!blockStatement.node.thisIdentifier) {
            const thisIdentifier = blockStatement.scope.generateUidIdentifier("this");
            blockStatement.node.thisIdentifier = thisIdentifier;
            const assignThis = t.variableDeclaration("var", [t.variableDeclarator(blockStatement.node.thisIdentifier, t.thisExpression())]);
            blockStatement.unshiftContainer("body", assignThis);
          }
        }
      }
    }
  };

  return {
    visitor: {
      GeneratorExpression: {
        /*
         * Wraps the body in a labelled block, wrapped by a do expression, which is returned in an immediately invoked generator function
         */
        exit(path, file) {
          const labelIdentifier = path.scope.generateUidIdentifier("label");
          const gexpContents = path.get("body");

          path.traverse(GeneratorExpressionVisitor, {
            labelIdentifier
          });

          const labeledStatement = t.labeledStatement(labelIdentifier, gexpContents.node);

          let newGeneratorContents;
          if (file.opts.enableCompletionValue) {
            newGeneratorContents = t.blockStatement([
              t.returnStatement(
                t.doExpression(
                  t.blockStatement([
                    labeledStatement
                  ])
                )
              )
            ]);
          } else {
            newGeneratorContents = t.blockStatement([
              labeledStatement
            ]);
          }
          const generatorFnc = t.functionExpression(null, [], newGeneratorContents, true, false);
          const immediateInvokedGeneratorFunction = t.callExpression(generatorFnc, []);
          path.replaceWith(immediateInvokedGeneratorFunction, path.node);
        }
      }
    }
  };
}