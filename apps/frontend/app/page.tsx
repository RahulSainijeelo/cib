import { Prompt } from "@/components/Prompt";
import { ProjectsDrawer } from "@/components/ProjectsDrawer";
import SideInfo from "@/components/SideInfo";
import { Appbar } from "@/components/Appbar";

export default function Home() {
  return (
    <div>
      <Appbar />
      <div className="p-4 md:pt-8">
        <ProjectsDrawer />
        <div className="max-w-2xl mx-auto pt-32 md:pt-52">
          <div className="text-5xl font-bold text-center">
            What do you want to build?
          </div>
          <div className="font-space-grotesk text-muted-foreground text-center p-2">
            Prompt, click generate and watch your app come to life
          </div>
          <div className="pt-4">
            <Prompt />
          </div>
        </div>
    </div>
   </div>
  );
}
