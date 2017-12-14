module.exports = function({types: t}) {
  return {
    visitor: {
      GeneratorExpression: {
        /*
         * Wraps the body in a labelled block, wrapped by a do expression, which is returned in an immediately invoked generator function
         */
        exit(path) {
          const labelIdentifier = path.scope.generateUidIdentifier("label");
          const gexpContents = path.get("body");

          path.traverse(GeneratorExpressionVisitor, {labelIdentifier});

          const labeledStatement = t.labeledStatement(labelIdentifier, gexpContents.node);
          const blockReturningDoExpr = t.blockStatement([
            t.returnStatement(
              t.doExpression(
                t.blockStatement([
                  labeledStatement
                ])
              )
            )
          ]);
          const generatorFnc = t.functionExpression(null, [], blockReturningDoExpr, true, false);
          const immediateInvokedGeneratorFunction = t.callExpression(generatorFnc, []);
          path.replaceWith(immediateInvokedGeneratorFunction, path.node);
        }
      }
    }
  };
}

const BREAKABLE_CONTAINER_NODE_TYPES = [
      "GeneratorExpression",
      "ForStatement",
      "DoWhileStatement",
      "WhileStatement",
      "ForInStatement",
      "ForOfStatement"
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
  }
};