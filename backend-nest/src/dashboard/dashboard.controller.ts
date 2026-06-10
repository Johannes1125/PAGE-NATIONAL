import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

@Controller()
@UseGuards(TokenAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin/metrics')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  adminMetrics() {
    return this.dashboardService.adminMetrics();
  }

  @Get('org/metrics')
  @UseGuards(RolesGuard)
  @Roles('organization', 'admin')
  @HttpCode(HttpStatus.OK)
  orgMetrics(@GetUser() user: any) {
    return this.dashboardService.orgMetrics(user);
  }
}
