import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let sharedSocket = null;

function getSocket() {
  if (!sharedSocket) {
    sharedSocket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 5000,
    });
  }
  return sharedSocket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [operations, setOperations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [latestOp, setLatestOp] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const socket = getSocket();

    const onConnect = () => {
      if (mountedRef.current) setConnected(true);
    };
    const onDisconnect = () => {
      if (mountedRef.current) setConnected(false);
    };
    const onOperation = (op) => {
      if (!mountedRef.current) return;
      setLatestOp(op);
      setOperations((prev) => [op, ...prev].slice(0, 100));
    };
    const onTransaction = (tx) => {
      if (!mountedRef.current) return;
      setTransactions((prev) => [tx, ...prev].slice(0, 50));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('db:operation', onOperation);
    socket.on('db:transaction', onTransaction);

    // Set initial connected state
    if (socket.connected) setConnected(true);

    return () => {
      mountedRef.current = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('db:operation', onOperation);
      socket.off('db:transaction', onTransaction);
    };
  }, []);

  const clearOps = useCallback(() => {
    setOperations([]);
    setLatestOp(null);
  }, []);

  return { connected, operations, transactions, latestOp, clearOps };
}
