/**
 * US States data for standardized state selection
 * Provides consistent state names and abbreviations for forms and filtering
 */

export interface USState {
  abbreviation: string;
  name: string;
  value: string; // What gets stored in database (using full name for consistency)
}

export const US_STATES: USState[] = [
  { abbreviation: 'AL', name: 'Alabama', value: 'Alabama' },
  { abbreviation: 'AK', name: 'Alaska', value: 'Alaska' },
  { abbreviation: 'AZ', name: 'Arizona', value: 'Arizona' },
  { abbreviation: 'AR', name: 'Arkansas', value: 'Arkansas' },
  { abbreviation: 'CA', name: 'California', value: 'California' },
  { abbreviation: 'CO', name: 'Colorado', value: 'Colorado' },
  { abbreviation: 'CT', name: 'Connecticut', value: 'Connecticut' },
  { abbreviation: 'DE', name: 'Delaware', value: 'Delaware' },
  { abbreviation: 'FL', name: 'Florida', value: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia', value: 'Georgia' },
  { abbreviation: 'HI', name: 'Hawaii', value: 'Hawaii' },
  { abbreviation: 'ID', name: 'Idaho', value: 'Idaho' },
  { abbreviation: 'IL', name: 'Illinois', value: 'Illinois' },
  { abbreviation: 'IN', name: 'Indiana', value: 'Indiana' },
  { abbreviation: 'IA', name: 'Iowa', value: 'Iowa' },
  { abbreviation: 'KS', name: 'Kansas', value: 'Kansas' },
  { abbreviation: 'KY', name: 'Kentucky', value: 'Kentucky' },
  { abbreviation: 'LA', name: 'Louisiana', value: 'Louisiana' },
  { abbreviation: 'ME', name: 'Maine', value: 'Maine' },
  { abbreviation: 'MD', name: 'Maryland', value: 'Maryland' },
  { abbreviation: 'MA', name: 'Massachusetts', value: 'Massachusetts' },
  { abbreviation: 'MI', name: 'Michigan', value: 'Michigan' },
  { abbreviation: 'MN', name: 'Minnesota', value: 'Minnesota' },
  { abbreviation: 'MS', name: 'Mississippi', value: 'Mississippi' },
  { abbreviation: 'MO', name: 'Missouri', value: 'Missouri' },
  { abbreviation: 'MT', name: 'Montana', value: 'Montana' },
  { abbreviation: 'NE', name: 'Nebraska', value: 'Nebraska' },
  { abbreviation: 'NV', name: 'Nevada', value: 'Nevada' },
  { abbreviation: 'NH', name: 'New Hampshire', value: 'New Hampshire' },
  { abbreviation: 'NJ', name: 'New Jersey', value: 'New Jersey' },
  { abbreviation: 'NM', name: 'New Mexico', value: 'New Mexico' },
  { abbreviation: 'NY', name: 'New York', value: 'New York' },
  { abbreviation: 'NC', name: 'North Carolina', value: 'North Carolina' },
  { abbreviation: 'ND', name: 'North Dakota', value: 'North Dakota' },
  { abbreviation: 'OH', name: 'Ohio', value: 'Ohio' },
  { abbreviation: 'OK', name: 'Oklahoma', value: 'Oklahoma' },
  { abbreviation: 'OR', name: 'Oregon', value: 'Oregon' },
  { abbreviation: 'PA', name: 'Pennsylvania', value: 'Pennsylvania' },
  { abbreviation: 'RI', name: 'Rhode Island', value: 'Rhode Island' },
  { abbreviation: 'SC', name: 'South Carolina', value: 'South Carolina' },
  { abbreviation: 'SD', name: 'South Dakota', value: 'South Dakota' },
  { abbreviation: 'TN', name: 'Tennessee', value: 'Tennessee' },
  { abbreviation: 'TX', name: 'Texas', value: 'Texas' },
  { abbreviation: 'UT', name: 'Utah', value: 'Utah' },
  { abbreviation: 'VT', name: 'Vermont', value: 'Vermont' },
  { abbreviation: 'VA', name: 'Virginia', value: 'Virginia' },
  { abbreviation: 'WA', name: 'Washington', value: 'Washington' },
  { abbreviation: 'WV', name: 'West Virginia', value: 'West Virginia' },
  { abbreviation: 'WI', name: 'Wisconsin', value: 'Wisconsin' },
  { abbreviation: 'WY', name: 'Wyoming', value: 'Wyoming' },
  { abbreviation: 'DC', name: 'District of Columbia', value: 'District of Columbia' }
];

// Helper functions for state data manipulation
export const getStateByAbbreviation = (abbreviation: string): USState | undefined => {
  return US_STATES.find(state => state.abbreviation.toLowerCase() === abbreviation.toLowerCase());
};

export const getStateByName = (name: string): USState | undefined => {
  return US_STATES.find(state => state.name.toLowerCase() === name.toLowerCase());
};

export const normalizeStateName = (input: string): string => {
  // Handle common variations and return standardized name
  const normalized = input.trim().toLowerCase();
  
  // Check for exact abbreviation match
  const byAbbrev = getStateByAbbreviation(input);
  if (byAbbrev) return byAbbrev.value;
  
  // Check for exact name match
  const byName = getStateByName(input);
  if (byName) return byName.value;
  
  // Handle common variations
  const variations: Record<string, string> = {
    'ill': 'Illinois',
    'illinois': 'Illinois',
    'calif': 'California',
    'california': 'California',
    'ny': 'New York',
    'nyc': 'New York',
    'la': 'Louisiana',
    'tx': 'Texas',
    'texas': 'Texas',
    'fl': 'Florida',
    'florida': 'Florida',
    'ga': 'Georgia',
    'georgia': 'Georgia'
  };
  
  return variations[normalized] || input; // Return original if no match found
};

export default US_STATES;