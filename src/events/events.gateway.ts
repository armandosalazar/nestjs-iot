import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private prisma = new PrismaClient();

  /**
   * Called when a client connects to the server
   * @param client ConnectedSocket
   */
  async handleConnection(@ConnectedSocket() client: Socket) {
    const predictions = await this.prisma.prediction.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // @note send the last 10 predictions to the client when they connect
    client.emit('sensor', predictions);

    console.log(`[+] client connected: ${client.id}`);
  }

  /**
   * Called when a client disconnects from the server
   * @param client ConnectedSocket
   */
  handleDisconnect(client: Socket) {
    console.log(`[-] client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sensor')
  handleSensor(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): void {
    const { humidity, temperatureCelsius } = JSON.parse(JSON.stringify(data));

    // @note spawn a child process to run the python script
    const process = spawn('python3', [
      'scripts/main.py',
      humidity,
      temperatureCelsius,
    ]);

    process.stdout.on('data', async (data) => {
      const dataObj = eval(`(${data.toString()})`);

      const prediction = await this.prisma.prediction.create({
        data: dataObj,
      });

      console.log(prediction);

      const predictions = await this.prisma.prediction.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });

      client.broadcast.emit('sensor', predictions);
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
