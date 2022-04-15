
using salmpledv2_backend.Models;
using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;

namespace salmpledv2_backend.Services {
    public interface IGenreService {
        Task<ServiceResponse<Genre>> CreateGenre(GenreDTO genreDTO);
        Task<ServiceResponse<List<Genre>>> GenreOptions(GenreDTO genreDTO);
    }
}