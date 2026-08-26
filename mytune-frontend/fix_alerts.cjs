const fs = require('fs');
const files = ['src/pages/Create.tsx', 'src/pages/Discover.tsx', 'src/pages/Library.tsx', 'src/components/GlobalPlayer.tsx'];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Only add import if not already there
  if (!c.includes("import toast from 'react-hot-toast';")) {
    // For GlobalPlayer it is `import React, { useState... } from 'react';`
    if (c.includes("import React,")) {
        c = c.replace(/import React, \{ ([^}]+) \} from 'react';/, "import React, { $1 } from 'react';\nimport toast from 'react-hot-toast';");
    } else {
        c = c.replace(/import \{ ([^}]+) \} from 'react';/, "import { $1 } from 'react';\nimport toast from 'react-hot-toast';");
    }
  }
  
  // Convert basic alerts
  c = c.replace(/alert\('([^']+)'\)/g, "toast('$1')");
  
  fs.writeFileSync(f, c);
});
