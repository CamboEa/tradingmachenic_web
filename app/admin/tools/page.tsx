import { DeleteToolButton } from "@/components/tools/delete-tool-button";
import {
  AdminPageHeader,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
} from "@/components/ui";
import { getAllTools } from "@/lib/supabase/tools";
import { cn } from "@/lib/ui/cn";

export const metadata = { title: "Tools" };

function NoImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-slate-100 bg-slate-50",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-6 w-6 text-slate-300"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
        />
      </svg>
      <span className="text-[10px] text-slate-400">No image</span>
    </div>
  );
}

export default async function ToolsPage() {
  const tools = await getAllTools();

  return (
    <div>
      <AdminPageHeader
        title="Tools"
        description="Publish indicators and expert advisors for your students."
        action={<ButtonLink href="/admin/tools/add">+ Add Tool</ButtonLink>}
      />

      {tools.length === 0 ? (
        <EmptyState
          title="No tools yet"
          description="Add your first indicator or expert advisor to show it on the public tools page."
          action={{ href: "/admin/tools/add", label: "+ Add Tool" }}
        />
      ) : (
        <div className="space-y-5">
          {tools.map((tool) => (
            <Card key={tool.id} padding={false} className="overflow-hidden">
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex min-w-0 flex-1 gap-4">
                  {tool.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tool.image_url}
                      alt=""
                      className="size-20 shrink-0 rounded-lg border border-slate-100 object-cover"
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-brand">{tool.name}</p>
                      <span className="text-xs text-slate-400">v{tool.version}</span>
                      <Badge variant={tool.status === "published" ? "published" : "draft"}>
                        {tool.status === "published" ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant={tool.pricing === "free" ? "teal" : "gold"}>
                        {tool.pricing === "free" ? "Free" : "Paid"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="neutral">{tool.platform}</Badge>
                      <Badge variant="neutral">
                        {tool.type === "indicator" ? "Indicator" : "Expert Advisor"}
                      </Badge>
                    </div>
                    {tool.description_en && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {tool.description_en}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                  <ButtonLink
                    href={`/admin/tools/edit/${tool.id}`}
                    variant="secondary"
                    className="px-3 py-2 text-xs"
                  >
                    Edit
                  </ButtonLink>
                  <DeleteToolButton id={tool.id} name={tool.name} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
