const fs = require('fs');
const path = require('path');

const files = [
  'app/(landing-page)/news/[slug]/page.tsx',
  'app/(landing-page)/news/page.tsx',
  'app/(landing-page)/journals/page.tsx',
  'app/(landing-page)/convention/[slug]/page.tsx',
  'app/(landing-page)/convention/page.tsx',
  'app/(landing-page)/contact/page.tsx',
  'app/(landing-page)/chapters/page.tsx',
  'app/(landing-page)/activities/[slug]/page.tsx',
  'app/(landing-page)/activities/page.tsx',
  'app/(landing-page)/about/page.tsx',
  'app/(landing-page)/about/logo/page.tsx',
  'app/(landing-page)/about/officers/page.tsx',
  'app/(landing-page)/about/history/page.tsx',
  'app/(landing-page)/about/cbl/page.tsx',
  'app/(landing-page)/(home)/page.tsx',
  'app/(landing-page)/components/Navbar.tsx'
];

files.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing file: ${relPath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace navbar logo subtitle
  content = content.replace(
    /<div className="navbar__logo-sub">Philippine Association for Graduate Education<\/div>/g,
    '<div className="navbar__logo-sub">PHILIPPINE ASSOC. FOR GRAD. ED.</div>'
  );

  // Replace footer logo subtitle
  content = content.replace(
    /<div className="footer__logo-sub">[^<]+<\/div>/g,
    '<div className="footer__logo-sub">PHILIPPINE ASSOC. FOR GRAD. ED.</div>'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${relPath}`);
});
