
using salmpledv2_backend.Models;
using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;

namespace salmpledv2_backend.Services {
    public interface ITagService {
        Task<ServiceResponse<Tag>> CreateTag(TagDTO TagDTO);
        Task<ServiceResponse<List<Tag>>> TagOptions(TagDTO TagDTO);
    }
}