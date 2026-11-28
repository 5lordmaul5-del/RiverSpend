export function chatMemoryPolicy(body) {
  const temporary = body?.temporaryChat === true;
  return Object.freeze({
    temporary,
    readMemory: !temporary,
    writeMemory: !temporary,
  });
}
