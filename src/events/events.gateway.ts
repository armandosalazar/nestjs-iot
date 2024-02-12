import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { spawn } from 'child_process';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[+] client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[-] client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sensor')
  handleEvent(client: Socket, data: string): void {
    const { humidity, temperatureCelsius } = JSON.parse(JSON.stringify(data));

    const process = spawn('python3', [
      'scripts/main.py',
      humidity,
      temperatureCelsius,
    ]);

    process.stdout.on('data', (data) => {
      const dataObj = JSON.parse(JSON.stringify(data.toString()));
      console.table(dataObj);
      // console.log(`stdout: ${data}`);
    });
    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    process.on('close', (code) => {
      if (code !== 0) console.log(`child process exited with code ${code}`);
    });
    // console.log(`[*] sensor::${client.id}::${JSON.stringify(data)}`);
  }
}
