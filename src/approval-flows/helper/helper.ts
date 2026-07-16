import { CreateSolicitudDto } from "../dto/create-approval-flow.dto";

export const resolveModuleAction = (request: CreateSolicitudDto, atribute?: string) => {
    if (request.metadata?.typeAction === "UPDATE" || atribute === "UPDATE") {
        request.moduleActionId = process.env.MODULE_ACTION_UPDATE_ID || "";
    } 
    else if (atribute === "ASSIGNMENT") {
        request.moduleActionId = process.env.MODULE_ACTION_ASSIGNMENT_ID || "";
    } 
    else if (request.metadata?.typeAction === "CHANGES" || atribute === "CHANGES") {
        request.moduleActionId = process.env.MODULE_ACTION_CHANGES_ID || "";
    } 
    else if (request.metadata?.typeAction === "RETURN" || atribute === "RETURN") {
        request.moduleActionId = process.env.MODULE_ACTION_RETURN_ID || "";
    }
    return request;
}