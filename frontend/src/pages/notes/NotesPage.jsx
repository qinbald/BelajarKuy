import QuickNotes from '../../components/dashboard/QuickNotes';
import PageHeader from '../../components/common/PageHeader';

export default function NotesPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Catatan & Memo Belajar" 
        subtitle="Kelola ide, ringkasan, dan catatan cepat harianmu"
      />

      <QuickNotes />
    </div>
  );
}
