import { ProjectSectionPage } from "@/components/layout/project-section-page";
import { auth } from "@/lib/auth";
import { getProjectSectionData } from "@/lib/project-sections";

export async function ProjectSectionRoute({ projectId, section }: { projectId: string; section: string }) {
  const session = await auth();
  const data = await getProjectSectionData(projectId, section, session?.user ?? null);

  return (
    <ProjectSectionPage
      projectId={projectId}
      section={section}
      title={data.title}
      description={data.description}
      records={data.records}
      metrics={data.metrics}
      recordType={data.recordType}
      currentUser={session?.user ?? null}
    />
  );
}