import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PlatformUserListItemDto } from '../../../../core/services/user.service';

@Component({
  selector: 'app-platform-user-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './platform-user-detail-dialog.component.html',
  styleUrl: './platform-user-detail-dialog.component.scss'
})
export class PlatformUserDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PlatformUserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: PlatformUserListItemDto
  ) {}
}