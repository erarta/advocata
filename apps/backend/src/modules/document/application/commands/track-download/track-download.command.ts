export class TrackDownloadCommand {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
  ) {}
}
