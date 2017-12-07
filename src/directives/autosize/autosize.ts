
import { Directive, HostListener, ElementRef, Input } from "@angular/core";

@Directive({
	selector: "ion-textarea[autosize]" // Attribute selector
})
export class Autosize {

	@HostListener('input', ['$event.target'])
	onInput(textArea: HTMLTextAreaElement): void {
		this.adjust();
  }

  @Input('autosize') maxHeight: number;
  
	constructor(public element: ElementRef) {
  }
  
	ngOnInit(): void {
		setTimeout(() => this.adjust(), 0);
  }
  
  adjust(): void {
    let ta = this.element.nativeElement.querySelector("textarea"),
        newHeight;
		
		if (ta) {
			// ta.style.overflow = "hidden";
      ta.style.height = "auto";
      if (this.maxHeight) {
        console.log('this.maxHeight',this.maxHeight)
        newHeight = Math.min(ta.scrollHeight, this.maxHeight);
        console.log('newHeight',newHeight)
      } else {
        newHeight = ta.scrollHeight;
      }
      ta.style.height = newHeight + "px";
		}
	}

}