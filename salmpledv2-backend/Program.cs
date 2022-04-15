using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using salmpledv2_backend.Models;
using salmpledv2_backend.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowEverything",
                    builder =>
                    {
                        builder
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowAnyOrigin()
                        .SetIsOriginAllowed(_ => true);
                    });
            });


var domain = $"https://{builder.Configuration["Auth0:Domain"]}/";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = domain;
        options.Audience = builder.Configuration["Auth0:Audience"];
    });

/*

services.AddAuthorization(options =>
        {
            options.AddPolicy("read:messages", policy => policy.Requirements.Add(new HasScopeRequirement("read:messages", domain)));
        });

        services.AddControllers();

        // Register the scope authorization handler
        services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();
*/


builder.Services.AddControllers().AddJsonOptions(j =>
        {
            j.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            j.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            j.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
            j.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            j.JsonSerializerOptions.WriteIndented = true;
        });
var con = builder.Configuration.GetConnectionString("SalmpledDatabase");
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<MyContext>(opt => opt.UseSqlServer(con));
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPackService, PackService>();
builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<ISampleService, SampleService>();
builder.Services.AddScoped<ITagService, TagService>();


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowEverything");


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
