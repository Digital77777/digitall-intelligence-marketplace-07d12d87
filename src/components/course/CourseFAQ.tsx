import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface CourseFAQProps {
  faqs?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How long do I have access to the course?",
    answer: "Once enrolled, you have lifetime access to all course materials. You can learn at your own pace and revisit the content whenever you need a refresher."
  },
  {
    question: "Is there a certificate upon completion?",
    answer: "Yes! Upon successfully completing all modules and assessments, you'll receive a digital certificate that you can share on LinkedIn or add to your resume."
  },
  {
    question: "What if I get stuck or have questions?",
    answer: "Our community forum is available for all enrolled students. You can ask questions, share insights, and connect with fellow learners and mentors."
  },
  {
    question: "Can I download the content for offline access?",
    answer: "Course materials including slides, notes, and resources are available for download. Video content requires an internet connection for streaming."
  },
  {
    question: "Is this course suitable for complete beginners?",
    answer: "Absolutely! This course is designed with beginners in mind. No prior AI or programming experience is required. We start from the fundamentals and build up gradually."
  },
  {
    question: "Can I access the course on mobile devices?",
    answer: "Yes, our platform is fully responsive. You can access all course content on your smartphone, tablet, or desktop computer."
  },
  {
    question: "What's the time commitment required?",
    answer: "We recommend dedicating 3-5 hours per week for optimal learning. At this pace, you can complete the course in 8-12 weeks. However, you're free to go faster or slower based on your schedule."
  },
  {
    question: "Is this course really free?",
    answer: "Yes, this course is completely free! We believe in making AI education accessible to everyone. There are no hidden fees or premium content locked behind paywalls."
  }
];

export const CourseFAQ = ({ faqs = defaultFAQs }: CourseFAQProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`faq-${index}`}
            className="border rounded-xl px-5 bg-card/50 hover:bg-card/80 transition-colors"
          >
            <AccordionTrigger className="hover:no-underline text-left py-4">
              <span className="font-medium pr-4">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
