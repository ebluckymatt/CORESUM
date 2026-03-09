import { ProjectSectionRoute } from "@/components/layout/project-section-route";

export default async function SectionPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectSectionRoute projectId={projectId} section="setup" />;
}