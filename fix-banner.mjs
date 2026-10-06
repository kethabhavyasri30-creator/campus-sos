import fs from 'fs';

function updateFile(path, updater) {
  const code = fs.readFileSync(path, 'utf8');
  const newCode = updater(code);
  if (code !== newCode) {
    fs.writeFileSync(path, newCode, 'utf8');
    console.log(`Updated ${path}`);
  }
}

updateFile('src/components/student/SosActiveBanner.jsx', (c) => {
  let res = c;
  res = res.replace("return (\n    {delivery === 'queued' && (", "return (\n    <>\n      {delivery === 'queued' && (");
  res = res.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}");
  return res;
});
