#!/bin/bash

# Função para verificar se uma porta está em uso
check_port() {
  local port=$1
  if lsof -i :$port > /dev/null 2>&1; then
    return 0  # Porta está em uso
  else
    return 1  # Porta está livre
  fi
}

# Porta padrão
DEFAULT_PORT=3001
PORT=$DEFAULT_PORT

# Verificar se a porta padrão está em uso
if check_port $PORT; then
  echo "Porta $PORT está em uso. Tentando porta alternativa..."
  
  # Tentar portas alternativas
  for alt_port in 3002 3003 3004 3005; do
    if ! check_port $alt_port; then
      PORT=$alt_port
      echo "Usando porta alternativa: $PORT"
      break
    fi
  done
  
  if [ $PORT -eq $DEFAULT_PORT ]; then
    echo "Não foi possível encontrar uma porta livre. Tente encerrar processos que estejam usando as portas 3001-3005."
    exit 1
  fi
else
  echo "Porta $PORT está livre. Usando porta padrão."
fi

# Iniciar o servidor com a porta selecionada
echo "Iniciando AdminDashboard na porta $PORT..."
PORT=$PORT npm start