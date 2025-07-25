declare module 'oracledb' {
  export interface ExecuteResult {
    rows?: any[][];
    metaData?: any[];
    outBinds?: any;
    rowsAffected?: number;
  }

  export interface Connection {
    execute(sql: string, binds?: any, options?: any): Promise<ExecuteResult>;
    close(): Promise<void>;
  }

  export interface ConnectionAttributes {
    user: string;
    password: string;
    connectString: string;
  }

  export function getConnection(attrs: ConnectionAttributes): Promise<Connection>;
  
  // Common Oracle constants
  export const BIND_IN: number;
  export const BIND_OUT: number;
  export const STRING: number;
  export const NUMBER: number;
  export const DATE: number;
  export const CURSOR: number;
  export const BUFFER: number;
  export const CLOB: number;
  export const BLOB: number;
}
