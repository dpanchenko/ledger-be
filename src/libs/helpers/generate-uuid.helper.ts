import { v4 as uuidv4 } from 'uuid';

import { UUID } from '@libs/types';

export const generateUuid = (): UUID => uuidv4();
