const KEYWORD_MAP = [
  { keywords: ['mobile', 'appium', 'android', 'ios'], icon: 'smartphone' },
  { keywords: ['security', 'owasp', 'auth', 'oauth', 'jwt', 'idors'], icon: 'shield' },
  { keywords: ['cloud', 'aws', 'azure', 'gcp', 'lambda'], icon: 'cloud' },
  { keywords: ['sql', 'database', 'db', 'postgres', 'mysql'], icon: 'database' },
  { keywords: ['api', 'rest', 'graphql', 'postman', 'soap'], icon: 'plug' },
  { keywords: ['ci/cd', 'cicd', 'pipeline', 'github actions', 'jenkins', 'harness'], icon: 'rocket-launch' },
  { keywords: ['docker', 'kubernetes', 'container', 'k8s', 'compose'], icon: 'stack' },
  { keywords: ['playwright', 'cypress', 'selenium', 'e2e', 'browser'], icon: 'browsers' },
  { keywords: ['performance', 'k6', 'load', 'stress', 'benchmark'], icon: 'chart-bar' },
  { keywords: ['apex', 'salesforce', 'sf'], icon: 'cloud' },
  { keywords: ['contract', 'pact', 'wiremock'], icon: 'file-text' },
  { keywords: ['unit', 'jest', 'junit', 'testng', 'mocha'], icon: 'check-circle' },
  { keywords: ['python', 'javascript', 'java', 'typescript', 'go', 'rust', 'apex'], icon: 'code' },
];

export function mapSubjectToIcon(subjectName, iconName) {
  if (iconName && iconName.length < 20 && !iconName.includes(' ')) {
    return iconName;
  }
  const name = (subjectName || '').toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(kw => name.includes(kw))) {
      return entry.icon;
    }
  }
  return 'book-open';
}

export default function DynamicIcon({ subjectName, iconName, className = 'nav-icon' }) {
  const icon = mapSubjectToIcon(subjectName, iconName);
  return <i className={`ph ${className} ph-${icon}`} />;
}
