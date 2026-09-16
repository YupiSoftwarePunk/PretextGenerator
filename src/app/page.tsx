'use client';

import { useRouter } from 'next/navigation';
import { FileText, LayoutGrid, ScrollText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { DocumentType } from '@/types';

interface DocumentTypeCard {
  type: DocumentType;
  title: string;
  description: string;
  icon: typeof FileText;
  color: 'pink' | 'cyan';
}

const documentTypes: DocumentTypeCard[] = [
  {
    type: 'slide',
    title: 'Слайды',
    description: 'Создавайте презентационные слайды с анимациями и переходами',
    icon: LayoutGrid,
    color: 'pink',
  },
  {
    type: 'card',
    title: 'Карточки',
    description: 'Визуальные карточки и флэшкарды для обучения',
    icon: FileText,
    color: 'cyan',
  },
  {
    type: 'cheatsheet',
    title: 'Шпаргалки',
    description: 'Структурированные справочники и инструкции',
    icon: ScrollText,
    color: 'pink',
  },
];

export default function Home() {
  const router = useRouter();

  const handleCreateDocument = (type: DocumentType) => {
    router.push(`/editor?type=${type}`);
  };

  const handleViewGallery = () => {
    router.push('/gallery');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-purple-900 via-dark-purple-800 to-dark-purple-900 flex flex-col">
      <header className="w-full py-8 px-6 border-b border-dark-purple-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-pink-500 to-neon-cyan-500 bg-clip-text text-transparent">
              Pretext Generator
            </h1>
            <p className="text-text-light-300 mt-2">Создавайте визуальный контент с разметкой Pretext</p>
          </div>
          <Button variant="secondary" onClick={handleViewGallery}>
            Галерея
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-text-light-100 mb-4">
            Выберите тип документа
          </h2>
          <p className="text-text-light-300 text-lg">
            Начните с выбора формата, который вам нужен
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            const glowClass = docType.color === 'pink' ? 'group-hover:shadow-neon-pink' : 'group-hover:shadow-neon-cyan';
            const iconColorClass = docType.color === 'pink' ? 'text-neon-pink-500' : 'text-neon-cyan-500';

            return (
              <Card
                key={docType.type}
                interactive
                className={`group ${glowClass}`}
                onClick={() => handleCreateDocument(docType.type)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full bg-dark-purple-700 ${iconColorClass} group-hover:animate-pulse-glow`}>
                    <Icon size={48} />
                  </div>
                  <h3 className="text-2xl font-semibold text-text-light-100">
                    {docType.title}
                  </h3>
                  <p className="text-text-light-300">
                    {docType.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-dark-purple-800/50 to-dark-purple-700/50 backdrop-blur">
            <h3 className="text-xl font-semibold text-text-light-100 mb-4">
              Что такое Pretext?
            </h3>
            <p className="text-text-light-300 leading-relaxed">
              Pretext — это минималистичная разметка для создания структурированного контента.
              Простой синтаксис позволяет быстро создавать слайды, карточки и шпаргалки,
              которые можно экспортировать в различные форматы.
            </p>
          </Card>
        </div>
      </main>

      <footer className="w-full py-6 px-6 border-t border-dark-purple-700">
        <div className="max-w-6xl mx-auto text-center text-text-light-400">
          <p>Создано для GitHub Pages • Powered by Next.js & Pretext</p>
        </div>
      </footer>
    </div>
  );
}
