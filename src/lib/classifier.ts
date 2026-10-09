import { AIAnalysisResult, IssueCategory, UrgencyLevel } from '../types/complaint';

export const DEPARTMENT_MAPPING: Record<string, string> = {
  Electrical: 'Electrical Department',
  Plumbing: 'Plumbing & Water Maintenance',
  Furniture: 'Maintenance Department',
  Cleanliness: 'Housekeeping Department',
  Infrastructure: 'Civil Infrastructure & Estate',
  Ventilation: 'HVAC & Maintenance',
  Classroom: 'Academic Administration',
  Laboratory: 'Lab Administration',
  Washroom: 'Housekeeping & Sanitation',
  Security: 'Campus Security Department',
  'Network / Internet': 'IT & Network Services',
  Other: 'General Campus Administration',
};

export function classifyIssueLocally(
  title: string,
  description: string,
  selectedCategory?: string
): AIAnalysisResult {
  const text = `${title} ${description}`.toLowerCase();

  // High urgency keywords
  const isCritical =
    text.includes('spark') ||
    text.includes('fire') ||
    text.includes('shock') ||
    text.includes('smoke') ||
    text.includes('theft') ||
    text.includes('weapon') ||
    text.includes('hazard') ||
    text.includes('severe flood');

  const isHigh =
    text.includes('overflow') ||
    text.includes('leakage') ||
    text.includes('not working') ||
    text.includes('broken fan') ||
    text.includes('blackout') ||
    text.includes('emergency') ||
    text.includes('urgent') ||
    text.includes('short circuit');

  let urgency: UrgencyLevel = 'Medium';
  if (isCritical) {
    urgency = 'Critical';
  } else if (isHigh) {
    urgency = 'High';
  } else if (text.includes('minor') || text.includes('noise') || text.includes('scratch')) {
    urgency = 'Low';
  }

  // Electrical match
  if (
    /\b(fan|light|bulb|switch|wire|wiring|electricity|socket|plug|power|blackout|mcb|short circuit|ac cooling)\b/i.test(
      text
    )
  ) {
    return {
      category: 'Electrical',
      urgency: isCritical ? 'Critical' : isHigh ? 'High' : 'Medium',
      department: DEPARTMENT_MAPPING['Electrical'],
      reason: 'Keywords identify electrical fixtures or power distribution components.',
      confidence: 88,
      isFallback: true,
    };
  }

  // Plumbing match
  if (
    /\b(water|tap|faucet|leakage|pipe|drainage|flush|sink|overflow|sewage|drip|moisture)\b/i.test(
      text
    )
  ) {
    return {
      category: 'Plumbing',
      urgency: isHigh ? 'High' : 'Medium',
      department: DEPARTMENT_MAPPING['Plumbing'],
      reason: 'Water supply, pipe, or drainage related terms identified in description.',
      confidence: 85,
      isFallback: true,
    };
  }

  // Cleanliness / Washroom
  if (/\b(washroom|toilet|restroom|urinal|commode)\b/i.test(text)) {
    return {
      category: 'Washroom',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Washroom'],
      reason: 'Hygiene and sanitation fixture issue in campus washroom facility.',
      confidence: 90,
      isFallback: true,
    };
  }

  if (/\b(dust|garbage|dirty|trash|waste|spill|clean|cleaning|sweep|stain|litter|foul smell)\b/i.test(text)) {
    return {
      category: 'Cleanliness',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Cleanliness'],
      reason: 'Sanitation and cleanliness attention needed by campus housekeeping.',
      confidence: 84,
      isFallback: true,
    };
  }

  // Furniture
  if (/\b(chair|desk|bench|table|furniture|podium|blackboard|podium|armrest|drawer|cupboard)\b/i.test(text)) {
    return {
      category: 'Furniture',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Furniture'],
      reason: 'Classroom or facility furniture repair requirement identified.',
      confidence: 82,
      isFallback: true,
    };
  }

  // Network / IT
  if (/\b(internet|wifi|wi-fi|network|lan|router|ethernet|server|connection|portal|switch port)\b/i.test(text)) {
    return {
      category: 'Network / Internet',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Network / Internet'],
      reason: 'Campus data connectivity or Wi-Fi network malfunction indicated.',
      confidence: 86,
      isFallback: true,
    };
  }

  // Infrastructure
  if (/\b(door|wall|ceiling|plaster|floor|tile|window|crack|staircase|railing|glass|roof|pillar)\b/i.test(text)) {
    return {
      category: 'Infrastructure',
      urgency: isHigh ? 'High' : 'Medium',
      department: DEPARTMENT_MAPPING['Infrastructure'],
      reason: 'Physical civil infrastructure or structural damage detected.',
      confidence: 80,
      isFallback: true,
    };
  }

  // Security
  if (/\b(security|guard|theft|stolen|trespass|cctv|lock|door lock|lost|fight|harassment|unauthorized)\b/i.test(text)) {
    return {
      category: 'Security',
      urgency: 'High',
      department: DEPARTMENT_MAPPING['Security'],
      reason: 'Campus physical security, access control, or vigilance concern.',
      confidence: 92,
      isFallback: true,
    };
  }

  // Ventilation
  if (/\b(ventilation|exhaust|suffocation|stuffy|airflow|blower)\b/i.test(text)) {
    return {
      category: 'Ventilation',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Ventilation'],
      reason: 'Air circulation or ventilation system improvement required.',
      confidence: 81,
      isFallback: true,
    };
  }

  // Laboratory
  if (/\b(lab|laboratory|microscope|chemical|apparatus|bunsen|spectrometer|fume hood)\b/i.test(text)) {
    return {
      category: 'Laboratory',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Laboratory'],
      reason: 'Laboratory equipment or scientific setup issue reported.',
      confidence: 83,
      isFallback: true,
    };
  }

  // Classroom
  if (/\b(projector|screen|speaker|podium|mic|marker|duster|smartboard)\b/i.test(text)) {
    return {
      category: 'Classroom',
      urgency: 'Medium',
      department: DEPARTMENT_MAPPING['Classroom'],
      reason: 'Lecture hall or teaching facility equipment issue.',
      confidence: 78,
      isFallback: true,
    };
  }

  // If user pre-selected a valid category
  if (selectedCategory && selectedCategory !== 'Auto Detect Category' && DEPARTMENT_MAPPING[selectedCategory]) {
    return {
      category: selectedCategory as IssueCategory,
      urgency: urgency,
      department: DEPARTMENT_MAPPING[selectedCategory] || 'General Campus Administration',
      reason: `Routed according to reported category (${selectedCategory}). Staff review recommended.`,
      confidence: 70,
      isFallback: true,
    };
  }

  return {
    category: 'Other',
    urgency: 'Medium',
    department: 'General Campus Administration',
    reason: 'Issue requires preliminary staff review to determine specialized assignment.',
    confidence: 60,
    isFallback: true,
  };
}
