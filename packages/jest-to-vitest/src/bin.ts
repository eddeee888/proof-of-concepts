#!/usr/bin/env node
import { program } from 'commander';
import * as path from 'path';
import { main } from './main';

program
  .name('jest2vitest')
  .version('0.0.1')
  .argument('<file pattern>')
  .action((filePattern: string) => {
    main(path.join(process.cwd(), filePattern));
  });

program.parse(process.argv);
