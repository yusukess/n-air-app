import { Inject } from 'util/injector';
import { NicoliveProgramService } from './nicolive-program';
import { map, distinctUntilChanged, bufferTime, filter } from 'rxjs/operators';
import { StatefulService, mutation } from 'services/stateful-service';
import { MessageServerClient, MessageServerConfig, isChatMessage, ChatMessage } from './MessageServerClient';
import { ChatMessageType, classify } from './ChatMessage/classifier';
import { Subscription, from } from 'rxjs';

export type WrappedChat = {
  type: ChatMessageType;
  value: ChatMessage;
};

interface INicoliveCommentViewerState {
  messages: WrappedChat[];
  popoutMessages: number;
  arrivalMessages: number;
}

export class NicoliveCommentViewerService extends StatefulService<INicoliveCommentViewerState> {
  private client: MessageServerClient | null = null;
  @Inject() private nicoliveProgramService: NicoliveProgramService;

  static initialState: INicoliveCommentViewerState = {
    messages: [],
    popoutMessages: 0,
    arrivalMessages: 0,
  };

  get items() {
    return this.state.messages;
  }

  init() {
    this.nicoliveProgramService.stateChange
      .pipe(
        map(({
          roomURL,
          roomThreadID,
        }) => ({
          roomURL,
          roomThreadID,
        })),
        distinctUntilChanged((prev, curr) => (
          prev.roomURL === curr.roomURL
          && prev.roomThreadID === curr.roomThreadID
        ))
      ).subscribe(state => this.onNextConfig(state));
  }

  lastSubscription: Subscription = null;
  private onNextConfig({
    roomURL,
    roomThreadID,
  }: MessageServerConfig): void {
    this.lastSubscription?.unsubscribe();
    this.clearState();
    this.client = new MessageServerClient({ roomURL, roomThreadID });
    // this.lastSubscription = this.client.connect().pipe(
    //   bufferTime(1000),
    //   filter(arr => arr.length > 0)
    // ).subscribe(values => {
    //   this.onMessage(values.filter(isChatMessage).map(x => ({
    //     type: classify(x.chat),
    //     value: x.chat,
    //   })));
    // })
    // this.client.requestLatestMessages();
    this.lastSubscription = from([
      {
        premium: 0,
        content: 'non premium user',
      },
      {
        premium: 1,
        content: 'premium user',
      },
      {
        premium: 3,
        content: 'operator comment',
      },
      {
        premium: 3,
        content: '/perm operator comment(perm)',
      },
      {
        premium: 3,
        content: '/nicoad {"version":"1","totalAdPoint":10000,"message":"【ニコニ広告】提供：○○さん「応援しています」（100pt）"}',
      },
      {
        premium: 3,
        content: '/gift 12345 23456 "ギフトを送った人" 500 "がんばってください" "ギフトの名前"',
      },
      {
        premium: 3,
        content: '/gift 12345 23456 "ギフトを送った人" 500 "貢献順位あり" "ギフトの名前" 1',
      },
      {
        premium: 3,
        content: '/spi "「ネタ」が貼られました"',
      },
      {
        premium: 3,
        content: '/quote "「${引用した配信者名}さん」が引用を開始しました ${引用している番組のコメント}（${引用した配信者名}さんの番組）"',
      },
      {
        premium: 3,
        content: '/cruise クルーズ。これ対応しなくていいのでは？',
      },
      {
        premium: 3,
        content: '/info 1 市場変更通知',
      },
      {
        premium: 3,
        content: '/info 2 コミュニティ新規加入通知',
      },
      {
        premium: 3,
        content: '/info 3 延長通知',
      },
      {
        premium: 3,
        content: '/info 5 タグ追加',
      },
      {
        premium: 3,
        content: '/info 6 地震速報通知',
      },
      {
        premium: 3,
        content: '/info 7 地震確定通知',
      },
      {
        premium: 3,
        content: '/info 8 ランクイン通知',
      },
    ].map((x, i) => ({ chat: {...x, vpos: i * 100, no: i + 1 }}))).pipe(
      bufferTime(1000),
      filter(arr => arr.length > 0)
    ).subscribe(values => {
        this.onMessage(values.filter(isChatMessage).map(x => ({
          type: classify(x.chat),
          value: x.chat,
        })));
      })
  }

  private onMessage(values: WrappedChat[]) {
    const arrivalLength = values.length;
    const concatMessages = this.state.messages.concat(values);
    const concatLength = concatMessages.length;
    this.SET_STATE({
      messages: concatMessages,
      popoutMessages: Math.max(concatLength - 200, 0),
      arrivalMessages: arrivalLength,
    });
  }

  private clearState() {
    this.SET_STATE({ messages: [], popoutMessages: 0, arrivalMessages: 0 });
  }

  @mutation()
  private SET_STATE(nextState: INicoliveCommentViewerState) {
    this.state = nextState;
  }

}