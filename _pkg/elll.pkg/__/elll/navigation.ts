import { BehaviorSubject, Observable } from "rxjs";

export class Navigation<T> {
  private history: T[] = [];
  private currentIndex: number = -1;

  private canGoBackSubject = new BehaviorSubject<boolean>(false);
  public canGoBack: Observable<boolean> = this.canGoBackSubject.asObservable();

  private canGoForwardSubject = new BehaviorSubject<boolean>(false);
  public canGoForward: Observable<boolean> =
    this.canGoForwardSubject.asObservable();

  private currentSubject = new BehaviorSubject<T | null>(null);
  public current: Observable<T | null> = this.currentSubject.asObservable();

  push(data: T): void {
    // Remove any forward history
    this.history = this.history.slice(0, this.currentIndex + 1);
    // Add new data
    this.history.push(data);
    // Update current index
    this.currentIndex = this.history.length - 1;
    // Emit new values
    this.updateSubjects();
  }

  goBack(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSubjects();
    }
  }

  goForward(): void {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.updateSubjects();
    }
  }

  private updateSubjects(): void {
    // Update canGoBack
    this.canGoBackSubject.next(this.currentIndex > 0);
    // Update canGoForward
    this.canGoForwardSubject.next(this.currentIndex < this.history.length - 1);
    // Update current
    const currentData = this.history[this.currentIndex] || null;
    this.currentSubject.next(currentData);
  }
}
