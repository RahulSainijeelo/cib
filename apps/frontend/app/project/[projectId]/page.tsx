"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_URL } from "@/config";
import { Send } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useActions } from "@/hooks/useActions";
import axios from "axios";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { WORKER_API_URL } from "@/config";
import { ProjectsDrawer } from "@/components/ProjectsDrawer";
import Image from "next/image";


export default function ProjectPage({ params }: { params: { projectId: string } }) {
    const { prompts } = usePrompts(params.projectId);
    const { actions } = useActions(params.projectId);
    const [prompt, setPrompt] = useState("");
    const { getToken } = useAuth();
    const {user} = useUser()

    const submitPrompt = async () => {
					const token = await getToken();
					axios.post(
						`${WORKER_API_URL}/prompt`,
						{
							projectId: params.projectId,
							prompt: prompt,
						},
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						},
					);
					setPrompt("");
				};

    return <div> 
        <div className="flex pt-16 flex-col md:flex-row">
            <div className="w-full md:w-1/4 h-[93vh] flex flex-col justify-between p-4">
                <div className="pt-4">
                    <Button variant={"ghost"} className="bg-primary-foreground rounded-full">
                        Chat history
                    </Button> 
                    <div className="mx-auto py-3">
                        <div className="flex flex-col gap-3">
                            {prompts.filter((prompt) => prompt.type === "USER").map((prompt) => (
                                <span key={prompt.id} className="flex gap-2 py-3 px-2 border rounded bg-secondary">
                                    <Image src={user?.imageUrl || ""} width={10} height={10} alt="Profile picture" className="rounded-full w-6 h-6" />
                                    {prompt.content}
                                </span>
                            ))}
                        </div> 
                        {actions.map((action) => (
                            <div key={action.id}>
                                {action.content}
                            </div>
                        ))}
                    </div>
               </div>
                <div className="flex gap-2 pb-8">
                    <Input 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type a message" 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                               submitPrompt(); 
                            }
                        }}
                    />
                    <Button onClick={submitPrompt}>
                        <Send />
                    </Button>
                </div>
            </div>
            <div className="md:w-3/4 p-8">
                <iframe src={`${WORKER_URL}/`} width={"100%"} height={"100%"} title="Project Worker" className="rounded-lg" />
            </div>
        </div>
        <ProjectsDrawer />
    </div>
}