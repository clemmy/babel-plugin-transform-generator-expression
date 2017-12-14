module.exports = function({types: t}) {
  return {
    visitor: {
      GeneratorExpression: {
        /*
         * Wraps the body in a labelled block, wrapped by a do expression, which is returned in an immediately invoked generator function
         */
        exit(path) {
          const gexpContents = path.get("body");
          const blockReturningDoExpr = t.blockStatement([
            t.returnStatement(
              t.doExpression(gexpContents.node)
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