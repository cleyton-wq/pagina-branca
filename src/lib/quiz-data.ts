export interface QuizQuestion {
  id: number;
  title: string;
  type: 'single-choice' | 'text';
  required?: boolean; // Add optional field
  options?: {
    value: string;
    label: string;
    image?: string;
  }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    title: "Which of these skin tones looks most like yours?",
    type: "single-choice",
    required: true,
    options: [
      {
        value: "fair-pink",
        label: "Fair with pink undertone",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/752f7a1c-f143-4c82-aac4-3f8879e9663e.jpg"
      },
      {
        value: "light-neutral",
        label: "Light neutral",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/1567f4f4-4292-4721-9ab7-9ab54004fa34.jpg"
      },
      {
        value: "medium-olive",
        label: "Medium olive",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/1f8ffa04-bf0c-47c7-ab71-0c35b5977f45.jpg"
      },
      {
        value: "warm-tan",
        label: "Warm tan",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/f02e4927-1b7f-423e-b5c7-6966ca96fe6f.jpg"
      },
      {
        value: "deep-brown",
        label: "Deep brown",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/1883657b-d3d5-4ece-a2e2-4c9a76093d38.jpg"
      }
    ]
  },
  {
    id: 2,
    title: "What's your natural hair color?",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "blonde", 
        label: "Blonde",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/629728ca-74ce-4e60-9422-5f5dc640747e.jpg"
      },
      { 
        value: "light-brown", 
        label: "Light Brown",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9320f488-f8af-45d2-b4b1-da475e55a5bc.jpg"
      },
      { 
        value: "dark-brown", 
        label: "Dark Brown",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/77997bf3-ad5f-445e-8384-663e874b10d1.jpg"
      },
      { 
        value: "black", 
        label: "Black",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/00988a43-5b11-400d-8f85-920cc3a54202.jpg"
      },
      { 
        value: "red", 
        label: "Red",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/1cb002ac-1768-49d9-bc45-5d19acc7c990.jpg"
      }
    ]
  },
  {
    id: 3,
    title: "What color are your eyes?",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "blue", 
        label: "Blue",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/ab98b329-3838-416b-8b8b-7b073a8f9e64.jpg"
      },
      { 
        value: "green", 
        label: "Green",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/abe5c174-2c62-4549-913a-05000fc6c6b8.jpg"
      },
      { 
        value: "light-brown", 
        label: "Light Brown",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/09bd74e7-c2bd-4292-b0a7-f2e97f05db42.jpg"
      },
      { 
        value: "dark-brown", 
        label: "Dark Brown",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9b78f349-25be-4056-8be5-8b4503218e93.jpg"
      },
      { 
        value: "black", 
        label: "Black",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/e04e4804-d74b-4b4b-9ab5-4db3774debf4.jpg"
      }
    ]
  },
  {
    id: 4,
    title: "In the sun, your skin usually…",
    type: "single-choice",
    required: true,
    options: [
      { value: "burns-peels", label: "Burns & peels" },
      { value: "tans-slightly", label: "Tans slightly" },
      { value: "tans-easily", label: "Tans easily" },
      { value: "very-tanned", label: "Gets very tanned" }
    ]
  },
  {
    id: 5,
    title: "Look at your wrist veins. They appear mostly…",
    type: "single-choice",
    required: true,
    options: [
      { value: "blue-purple", label: "Blue / Purple" },
      { value: "green", label: "Green" },
      { value: "hard-to-tell", label: "Hard to tell / In-between" }
    ]
  },
  {
    id: 6,
    title: "Which clothing colors make you look fresher or more radiant?",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "soft-pastels", 
        label: "Soft Pastels Tones",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/944c9fee-103c-41a7-afcb-2db9149d7223.jpg"
      },
      { 
        value: "warm-tones", 
        label: "Warm Tones",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/f829330b-5221-432d-bf0c-240e8fee4e08.jpg"
      },
      { 
        value: "deep-rich", 
        label: "Deep Rich Tones",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/072071ee-56fa-423d-bec2-e43dd8ccdf66.jpg"
      },
      { 
        value: "bright-vivid", 
        label: "Bright Vivid Tones",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/549b08b1-ed7e-44b9-bb3d-ca4e69e2c98c.jpg"
      },
      { 
        value: "cool-tones", 
        label: "Cool Tones",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/7ab13867-c473-47fc-a58b-e564523a5f28.jpg"
      }
    ]
  },
  {
    id: 7,
    title: "Which jewelry tone suits you best?",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "gold", 
        label: "Gold",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/0d21a0a9-b931-4fdd-a51f-93caab6d25ca.jpg"
      },
      { 
        value: "silver", 
        label: "Silver",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/93a7d465-e421-45dd-8c55-1e32fbbd493a.jpg"
      },
      { 
        value: "mixed", 
        label: "Mixed metals",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/60025efa-5921-472b-91d6-84530e6e7a73.jpg"
      }
    ]
  },
  {
    id: 8,
    title: "What type of color change would you like to try right now?",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "subtle-highlights", 
        label: "Subtle Highlights",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2c5157b0-4b9e-4fd1-9d73-269733097ca1.jpg"
      },
      { 
        value: "full-color-change", 
        label: "Full Color Change",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/e752caa1-92f1-41f6-8c5e-c1bb264f7670.jpg"
      },
      { 
        value: "darker-glossy", 
        label: "Darker Glossy Enhancement",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/dd23dcbf-0853-425a-950f-a9968f1fbd6d.jpg"
      }
    ]
  },
  {
    id: 9,
    title: "Pick one color family you're curious to try:",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "beige-golden", 
        label: "Beige/Golden Blonde",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/c58a19c0-97ec-4d1f-ab03-114d282c9ba4.jpg"
      },
      { 
        value: "copper-ginger", 
        label: "Copper/Soft Ginger",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/23186791-0067-4630-ba44-b2f9fb2112e0.jpg"
      },
      { 
        value: "chocolate-brown", 
        label: "Chocolate Brown",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/b6247dea-4cf1-4e62-9be6-f15ae20c62b1.jpg"
      },
      { 
        value: "blue-black", 
        label: "Blue-Black/Cool Black",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/218d9303-e2e3-457f-8e3c-42faa3db0345.jpg"
      }
    ]
  },
  {
    id: 10,
    title: "If your color vibe were a season, which one would it be?",
    type: "single-choice",
    required: true,
    options: [
      { 
        value: "spring", 
        label: "Spring",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/26af95c0-c7b0-497f-964b-9c5f3ba190a8.jpg"
      },
      { 
        value: "summer", 
        label: "Summer",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2918a77f-789e-42ff-91b4-24e30876d887.jpg"
      },
      { 
        value: "autumn", 
        label: "Autumn",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/cef8ff69-7a87-44d2-b452-08220b4435f5.jpg"
      },
      { 
        value: "winter", 
        label: "Winter",
        image: "https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2bce4c1e-5fcd-4bee-bad6-0a22f363194f.jpg"
      }
    ]
  },
  {
    id: 11,
    title: "Anything we should consider?",
    type: "text",
    required: false // Make question 11 optional
  }
];

export type ColorSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export const seasonPDFs: Record<ColorSeason, string> = {
  spring: "https://drive.google.com/file/d/1pWvcD-rMgWPSwFZVel3CUJCZx5rF3AZ_/view?usp=sharing",
  summer: "https://drive.google.com/file/d/1QVXHuP4cWhBqWPv_LthyksIT0Ql-n9XB/view?usp=sharing",
  autumn: "https://drive.google.com/file/d/1MFJ34KIvvSQJneooc_Goyjqe_yYtyj-7/view?usp=sharing",
  winter: "https://drive.google.com/file/d/1sO2MifVy1hkUfJT-vt4DrSsd-LcH32rS/view?usp=sharing"
};