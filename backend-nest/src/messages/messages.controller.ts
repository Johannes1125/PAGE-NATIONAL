import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(TokenAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  index(@GetUser() user: any) {
    return this.messagesService.index(user);
  }

  @Get(':conversationId')
  @HttpCode(HttpStatus.OK)
  show(@Param('conversationId') conversationId: string, @GetUser() user: any) {
    return this.messagesService.show(conversationId, user);
  }

  @Post()
  @UseInterceptors(FileInterceptor('attachment'))
  @HttpCode(HttpStatus.CREATED)
  store(
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @GetUser() user: any,
  ) {
    return this.messagesService.store(createMessageDto, file, user);
  }
}
