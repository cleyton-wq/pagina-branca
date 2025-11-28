const PDF_URLS: Record<"Spring" | "Summer" | "Autumn" | "Winter", string> = {
  Spring: "https://drive.google.com/file/d/1pWvcD-rMgWPSwFZVel3CUJCZx5rF3AZ_/view?usp=sharing",
  Summer: "https://drive.google.com/file/d/1QVXHuP4cWhBqWPv_LthyksIT0Ql-n9XB/view?usp=sharing",
  Autumn: "https://drive.google.com/file/d/1MFJ34KIvvSQJneooc_Goyjqe_yYtyj-7/view?usp=sharing",
  Winter: "https://drive.google.com/file/d/1sO2MifVy1hkUfJT-vt4DrSsd-LcH32rS/view?usp=sharing",
};

export function getPdfUrlForSeason(season: "Spring" | "Summer" | "Autumn" | "Winter"): string {
  return PDF_URLS[season] ?? PDF_URLS.Spring;
}