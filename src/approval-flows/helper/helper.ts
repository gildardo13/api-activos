import { CreateSolicitudDto } from "../dto/create-approval-flow.dto";

export const resolveModuleAction = (request: CreateSolicitudDto) => {
    if (request.metadata?.typeAction === "UPDATE") {
        request.moduleActionId = process.env.MODULE_ACTION_UPDATE_ID || "";
    } 
    else if (request.metadata?.typeAction === "ASSIGNMENT") {
        request.moduleActionId = process.env.MODULE_ACTION_ASSIGNMENT_ID || "";
    } 
    else if (request.metadata?.typeAction === "CHANGES") {
        request.moduleActionId = process.env.MODULE_ACTION_CHANGES_ID || "";
    } 
    else if (request.metadata?.typeAction === "RETURN") {
        request.moduleActionId = process.env.MODULE_ACTION_RETURN_ID || "";
    }
    return request;
}