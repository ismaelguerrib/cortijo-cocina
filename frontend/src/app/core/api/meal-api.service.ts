import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MealAssignment, MealAssignmentPayload } from '../models/meal-assignment.model';

@Injectable({ providedIn: 'root' })
export class MealApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/meal-assignments`;

  getAll(): Observable<MealAssignment[]> {
    return this.httpClient.get<MealAssignment[]>(this.baseUrl);
  }

  create(payload: MealAssignmentPayload): Observable<MealAssignment> {
    return this.httpClient.post<MealAssignment>(this.baseUrl, payload);
  }

  update(id: string, payload: MealAssignmentPayload): Observable<MealAssignment> {
    return this.httpClient.patch<MealAssignment>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
