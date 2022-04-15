using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace salmpledv2_backend.Services
{
    public class GenreService : IGenreService
    {
        private readonly MyContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GenreService(MyContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<ServiceResponse<Genre>> CreateGenre(GenreDTO genreDTO)
        {

            ServiceResponse<Genre> res = new ServiceResponse<Genre>();

            try
            {
                Genre newGenre = new Genre
                {
                    Name = genreDTO.Name
                };
                
                await _context.Genres.AddAsync(newGenre);

                await _context.SaveChangesAsync();

                res.Result = newGenre;

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;

        }


        public async Task<ServiceResponse<List<Genre>>> GenreOptions(GenreDTO genreDTO) {
            ServiceResponse<List<Genre>> res = new ServiceResponse<List<Genre>>();

            try
            {

                var query = from genres in _context.Genres
                            where genres.Name.Contains(genreDTO.Name)
                            orderby genres.Name ascending
                            select new Genre{
                                Id = genres.Id,
                                Name = genres.Name,
                            };
                            
                res.Result = await query.Take(25).ToListAsync();

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;
        }

    }
}