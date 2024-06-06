export class ProjectView {

    constructor({
        scene=null,
        id=null,
        name,
        type,
        properties={},
        children=[],
    }) {
        this.scene = scene;
        this.id = id ?? crypto.randomUUID();
        this.name = name;
        this.type = type;
        this.properties = properties;
        this.children = children;
    }

    createView(projectViewData) {
        const projectView = ProjectView.create(projectViewData, this.scene);

        this.children.push(projectView);

        return projectView;
    }

    static create(projectViewData, scene) {
        const projectView = new ProjectView({
            scene,
            name: projectViewData.name,
            type: projectViewData.type,
            properties: projectViewData.properties,
        });

        projectViewData.children?.forEach(child => projectView.createView(child));

        return projectView;
    }
}