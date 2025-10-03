import { Hono } from "hono";

const test = new Hono();

test.post("/", async(c)=>{
    const body = await c.req.parseBody();
    if (!body["assignmentPdf"]){
        return c.json({ message: "Please upload an assignment PDF"}, 400);
    }
    if(!body["numPages"]){
        return c.json({ message: "Please pass in the number of pages"}, 400);
    }
    if(!body["coverPage"]){
        return c.json({ message: "Please pass in the cover page type"}, 400);
    }

    if(!body["assignmentType"]){
        return c.json({ message: "Please pass in the assignment type"}, 400);
    }

    if(!body["outlines"] || !body["references"]){
        return c.json({ message: "Please pass in the outlines and references options"}, 400);
    }

    const {
        assignmentPdf,
        numPages,
        coverPage,
        assignmentType,
        outlines,
        references,
    } = body;
    // const groupMembersObject = JSON.parse(body.groupMembers as string);
    // const groupMembers = Object.values(groupMembersObject);
    console.log(body)
    return c.json({ message: "Test route is working!", data: body });
})

export default test;