import Link from "next/link";
import { notFound } from "next/navigation";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import DocumentLibrary from "../DocumentLibrary";
import DocumentArchive from "../DocumentArchive";
import DocumentBulkUpload from "../DocumentBulkUpload";
import styles from "./documents.module.css";

const documentPages: Record<string, { title: string; description: string }> = {
  library: {
    title: "Document Library",
    description: "Browse and manage the national document collection.",
  },
  "bulk-upload": {
    title: "Bulk Upload",
    description: "Upload multiple documents to the national collection.",
  },
  archive: {
    title: "Archive",
    description: "Review documents that have been archived.",
  },
};

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = documentPages[slug];

  if (!page) {
    notFound();
  }

  if (slug === "library") {
    return <DocumentLibrary />;
  }

  if (slug === "archive") {
    return <DocumentArchive />;
  }

  if (slug === "bulk-upload") {
    return <DocumentBulkUpload />;
  }

  return (
    <AdminSidebarLayout
      pageClassName=""
      mainClassName=""
      title={page.title}
      subtitle={page.description}
      eyebrow="Content"
    >
      <main className={`admin-shell admin-shell--main ${styles.page}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span>Content</span>
          <span className={styles.separator} aria-hidden="true">&gt;</span>
          <Link href="/admin-dashboard/documents/library">Documents</Link>
          <span className={styles.separator} aria-hidden="true">&gt;</span>
          <span className={styles.current} aria-current="page">{page.title}</span>
        </nav>

        <section className={styles.content}>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </section>
      </main>
    </AdminSidebarLayout>
  );
}
