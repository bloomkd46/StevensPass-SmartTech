import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";

type NavLink = {
  label: string;
  href: string;
  disabled?: boolean;
};

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
