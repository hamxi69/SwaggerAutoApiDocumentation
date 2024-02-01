import { ControllerInfo } from "interfaces/ControllerInfo";
import { Project, ts } from "ts-morph";
import { MethodInfo } from "interfaces/RouteMethodInfo";

export const extractController = (filePath: string): ControllerInfo[] => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const controllers: ControllerInfo[] = [];

  sourceFile.getClasses().forEach(classDeclaration => {
    const controllerDecorator = classDeclaration.getDecorator("Controller");

    if (controllerDecorator) {
      const controllerName = controllerDecorator.getArguments()[0]?.getText();
      const methods: MethodInfo[] = [];

      classDeclaration.getMethods().forEach(methodDeclaration => {
        const routeDecorators = methodDeclaration.getDecorators().filter(d =>
          d.getName() === "Post" || d.getName() === "Get" || d.getName() === "Put" || d.getName() === "Delete"
        );

        if (routeDecorators.length > 0) {
          const route = routeDecorators[0].getArguments()[0]?.getText();
          const params: { name?: string; type?: string , required?:boolean, in?:string}[] = [];
          let Properties: { name: string, type: string | { name: string, type: string, required: boolean }[], required:boolean }[] = [];
          const excludeProperties = ["_id", "CreatedOn", "CreatedBy", "DeletedOn", "DeletedBy", "UpdatedBy", "UpdatedOn", "IsDeleted", "IsActive"];
          let bodyModel='';
          methodDeclaration.getParameters().forEach(param => {
            const paramName = param.getName();
            const paramType = param.getType().getText();
            
            const isParam = param.getDecorator("Param");
            const isQueryParam = param.getDecorator("QueryParam");
            const isBodyParam = param.getDecorator("Body");

            const isRequired = route?.includes(`:${paramName}`);

            if (isParam) {
                params.push({ name: paramName, type: paramType, required: !!isRequired, in:'path' });

            } else if (isQueryParam) {
                params.push({ name: paramName, type: `QueryParam<${paramType}>`, required: !!isRequired, in:'query' });
            }

            const foundParam = params.find(p => p.name === paramName);
            if (route?.includes(`:${paramName}?`) && foundParam) {
              foundParam.required = false;
            }

            if (isBodyParam) {
              const typeNode = param.getTypeNode();
              bodyModel = route ? extractBodyModelName(route,controllerName) : '';
              if (typeNode) {
                let daoType: { name: string, type: string | { name: string, type: string, required: boolean }[], required: boolean }[] = [];
                if (typeNode.getKind() === ts.SyntaxKind.TypeReference) {
                  const properties = project.getTypeChecker().getTypeAtLocation(typeNode).getProperties();
                  daoType = properties.map(prop => {
                    const isRequired = !(prop.getFlags() & ts.SymbolFlags.Optional);
                    let typeText:string | { name: string, type: string, required: boolean }[];
                         typeText = project.getTypeChecker().getTypeOfSymbolAtLocation(prop, typeNode).getText();
                    if (typeText.startsWith("import")) {
                      const importPathMatch = typeText.match(/"([^"]+)"/);

                      if (importPathMatch && importPathMatch[1]) {
                        const importPath = importPathMatch[1];
                        const importPathWithExtension = `${importPath}.ts`;
                        const childInterface = getInterfaceProperties(importPathWithExtension,excludeProperties);
                        typeText = childInterface ? childInterface : "unknown";
                      }                    
                    }
                    return {
                      name: prop.getName(),
                      type: typeText,
                      required: isRequired,
                    };
                  });
                }
                Properties = daoType
                .filter(prop => !excludeProperties.includes(prop.name))
                .map(prop => ({ name: prop.name, type: prop.type, required: prop.required }));
                params.push({ name: bodyModel, in:'body' });
              }
            }
          });

          methods.push({
            Method: routeDecorators[0].getName(),
            Route: route || '',
            Params: params,
            BodyModel:bodyModel,
            Properties: Properties
          });
        }
      });

      controllers.push({
        ControllerName: controllerName || '',
        Methods: methods.filter(method => method.Method === "Post" || method.Method === "Get" || method.Method === "Put" || method.Method === "Delete")
      });
    }
  });
  return controllers;
};

function getInterfaceProperties(filePath: string, excludedProperties: string[] = []): { name: string, type: string, required: boolean }[] | null {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  const interfaceDeclaration = sourceFile.getInterfaces()[0];

  if (interfaceDeclaration) {
    return interfaceDeclaration.getProperties()
      .filter(prop => !excludedProperties.includes(prop.getName())) 
      .map(prop => {
        const isRequired = !(prop.hasQuestionToken());
        return {
          name: prop.getName(),
          type: prop.getType().getText(),
          required: isRequired,
        };
      });
  }

  return null;
}

function extractBodyModelName(route: string, controllerName: string): string {
  const routeWithoutQuery = route.split('?')[0];

  const parts = routeWithoutQuery.split('/');
  const lastPart = parts[parts.length - 1];

  const cleanedControllerName = controllerName.replace(/'/g, '');
  const cleanedLastPart = lastPart.replace(/'/g, '');

  const pathWithoutParams = cleanedLastPart.replace(/:[^\/]+/g, '');

  const bodyModelName = (cleanedControllerName + ' ' + pathWithoutParams)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return bodyModelName.trim();
}




